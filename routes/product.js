const express = require('express');

const router = express.Router();
const Sequelize = require('sequelize');
const {sequelize,Products} = require('../models/product');
const { v4: uuidv4 } = require('uuid');
const {multerStorage} = require('../config/multerFileUpload');
const multer = require('multer');
const upload = multer({storage:multerStorage});
const fs = require('fs');

/** Add new product with image */
router.post('/', upload.single('image'),async(req, res) => {
    try{
        console.log('call the create product api ')
        let {name,price} = req.body;
        // let img = await upload.single('image');
        if(!name || !price){
            fs.unlinkSync(req.file.path);
            return res.status(400).json({status:400,message:"name or price required."});
        }      
    //     console.log('file:',req.file);   
    //    if(!req.file){
    //     return res.status(400).json({status:400,message:"image required."});
    //    }
        const timestamp =Math.floor(Date.now()/1000);
        let productData = {
            id:uuidv4(),
            name:name,
            Image:req.file.path,
            price:price,
            createdAt:timestamp,
            updatedAt:timestamp
        }
        console.log(productData)
        // let check if the product already exist or not
        const existProduct = await Products.findOne({ where: { name: name }});
        // console.log("existing product:",existProduct);
        if(existProduct){
            fs.unlinkSync(req.file.path);
            return res.status(409).json({status:409,message:'product already exist'});
        }
        const product = await Products.create({
            id:uuidv4(),
            name:name,
            image:req.file.path,
            price:price,
            createdAt:timestamp,
            updatedAt:timestamp
        });
        return res.status(201).json({status:201,message:'product added successfully.', data:product});
    }
    catch(error){
        console.log(error);
        return res.status(500).json({status:500,message:error.message});
    }
//   res.json(products);
});


/**update product */
router.post('/product/update', async(req, res, next) => {
  try{
    let {id,name,price}=req.body;
    if(!id){
        return res.status(400).json({status:400,message:'for update product id field required'});
    }
    const findProduct  = await Products.findOne({where:{id:id}});
    console.log(findProduct);
    if(!findProduct){
        return res.status(400).json({
            status:400,
            message:"product not found."
        });
    }
    //let check for duplication
    const findDuplicateProduct = await sequelize.query(`select * from products where name = '${name}' and id<>'${id}'; `,
    {type: sequelize.QueryTypes.SELECT});
    console.log('duplicate:',findDuplicateProduct);
    if(findDuplicateProduct.length>0){
        return res.status(400).json({
            status:400,
            message:"this name of product already exist."
        });
    }
    const updateProduct  = await Products.update({name:name,price:price},{
        where:{id:id}
    });
    // console.log('updateProduct:',updateProduct);
    const getUpdated =  await Products.findOne({where:{id:id}});
    return res.status(200).json({status:200,data:getUpdated,message:'product updated successful.'});
  }
  catch(error){
    console.log(error);
    return res.status(500).json({status:500,message:error.message});
  }
});

/**get all product list with all filters here */
router.get('/product/getAll', async(req, res, next) => {
 try{
    console.log('get all product with includes all filter');
    let {page,limit,startDate,endDate,search} = req.query;
    page = page?page:1;
    limit = limit?limit:10;
    page = page*limit-limit;
    let where ='where isNull(id)=false' ;
    if(search || startDate || endDate){
        if(startDate){
            where =where.concat(` and  createdAt<=${startDate} `);
        }
        if(endDate){
            // startDate = startDate?'':Math.floor(Date.now()/1000);
            where = startDate?where.concat(` and createdAt>=${endDate}`):where.concat(` and createdAt>=${Math.floor(Date.now()/1000)} and createdAt>=${endDate}`)
        }
        if(search){
            where = where.concat(` and name like '%${search}%' `);
        }
    }
    let orderBy = ` order by createdAt desc`
    let selectClause = `select * from products `; 
    let query = ` ${selectClause} ${where} ${orderBy} limit ${limit} offset ${page} ;`;
    // console.log(query);
    const products = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT});
    // console.log(products);
    let count = await sequelize.query(` select count(*) as count from products ${where} ${orderBy} ;`
    ,{type: sequelize.QueryTypes.SELECT})
    return res.status(200).json({status:200,message:'products fetched',data:products,totalProducts:count[0].count});

 }
 catch(error){
    return res.status(500).json({status:500,message:error.message});
 }
});

/**list of product only with pagingnation */
router.get('/product/get-with-pagingnation', async(req, res, next) => {
    try{
       console.log('get all product with pagingnation');
       let {page,limit} = req.query;
       page = page?page:1;
       limit = limit?limit:10;
       page = page*limit-limit;
       let orderBy = ` order by createdAt desc`
       let selectClause = `select * from products `; 
       let query = ` ${selectClause} ${orderBy} limit ${limit} offset ${page}`;
       // console.log(query);
       const products = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT});
       let count = await sequelize.query('select count(*) as count from products '
        ,{type: sequelize.QueryTypes.SELECT});
       // console.log(products);
       return res.status(200).json({status:200,message:'products fetched',data:products,totalCount:count[0].count});
   
    }
    catch(error){
       return res.status(500).json({status:500,message:error.message});
    }
   });

   /** search filter with product name */
   router.get('/product/get-by-search', async(req, res, next) => {
    try{
       console.log('get product by search');
       let {search} = req.query;
       let where ='' ;
       if(search){
            where = where.concat(`where name like '%${search}%' `);
       }
       let selectClause = `select * from products `; 
       let query = ` ${selectClause} ${where} ;`;
       // console.log(query);
       const products = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT});
       // console.log(products);
       let count = await sequelize.query(` select count(*) as count from products ${where} ;`
       ,{type: sequelize.QueryTypes.SELECT})
       return res.status(200).json({status:200,message:'products fetched',data:products,totalProducts:count[0].count});
   
    }
    catch(error){
       return res.status(500).json({status:500,message:error.message});
    }
   });

   /**only for filter with date range */
   router.get('/product/get-by-range', async(req, res, next) => {
    try{
       console.log('get all product by date range');
       let {startDate,endDate} = req.query;
      
       let where ='where isNull(id)=false' ;
       if(startDate || endDate){
           if(startDate){
               where =where.concat(` and  createdAt<=${startDate} `);
           }
           if(endDate){
               // startDate = startDate?'':Math.floor(Date.now()/1000);
               where = startDate?where.concat(` and createdAt>=${endDate}`):where.concat(` and createdAt>=${Math.floor(Date.now()/1000)} and createdAt>=${endDate}`)
           }
       }
       let selectClause = `select * from products `; 
       let query = ` ${selectClause} ${where} ;`;
       // console.log(query);
       const products = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT});
       // console.log(products);
       let count = await sequelize.query(` select count(*) as count from products ${where} ;`
       ,{type: sequelize.QueryTypes.SELECT})
       return res.status(200).json({status:200,message:'products fetched',data:products,totalProducts:count[0].count});
   
    }
    catch(error){
       return res.status(500).json({status:500,message:error.message});
    }
   });

   /**sorting on following creation date */

   /**get all product list with all filters here */
router.get('/product/get-by-creation', async(req, res, next) => {
    try{
       console.log('get all product by creation desc order');
       
       let orderBy = ` order by createdAt desc`
       let selectClause = `select * from products `; 
       let query = ` ${selectClause}  ${orderBy} ;`;
       // console.log(query);
       const products = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT});
       // console.log(products);
       let count = await sequelize.query(` select count(*) as count from products  ${orderBy} ;`
       ,{type: sequelize.QueryTypes.SELECT})
       return res.status(200).json({status:200,message:'products fetched',data:products,totalProducts:count[0].count});
   
    }
    catch(error){
       return res.status(500).json({status:500,message:error.message});
    }
   });

module.exports = router;
