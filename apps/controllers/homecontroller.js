<<<<<<< HEAD
// apps/controllers/homecontroller.js
const ProductModel = require('../models/product');

module.exports = {
    index: async (req, res) => {
        try {
            const products = await ProductModel.getAllProducts();
            // Render file apps/views/home.ejs
            res.render('home', { products: products });
        } catch (error) {
            console.log(error);
            res.status(500).send("Lỗi Server");
        }
    }
};
=======
// var express = require("express");
// var router = express.Router();
// router.use("/home", require(__dirname + "/homecontroller"));
// router.use("/product", require(__dirname +
// "/productcontroller"));
// router.get("/", function(req,res){
//     res.json({"message": "this is index page"});
// });
// module.exports = router;
>>>>>>> 818086f3a5e7648cff072a20643f6dfa9bdd426d
