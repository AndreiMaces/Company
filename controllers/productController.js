const productModel = require('../models/productModel.js');
const FB = require("fb");

module.exports.getProducts = async (req, res) => {
    const foundItems = await productModel.find({}).sort({
        _id: -1
    });
    res.render('../views/product/products', {
        newProductItem: foundItems
    });
};

module.exports.productForm = (req, res) => {
    res.render("../views/product/productForm.ejs");
};

module.exports.updateProduct = async (req, res) => {
    const { newTitle, newDescription } = req.body;
    const { id } = req.params;
    const product = await productModel.findByIdAndUpdate(id, { title: newTitle, image: req.file.path || "https://media.mixbook.com/images/templates/97_1_0_m.jpg", description: newDescription });
    await product.save();

    res.redirect(`/product/${id}`);
}

module.exports.updateForm = async (req, res) => {
    const product = await productModel.findById(req.params.id);
    if (product) {
        res.render("../views/product/updateForm", { product });
        return;
    }
    console.log("Product not found");
    res.redirect("/product/all");
};

module.exports.productFormPost = async (req, res) => {
    const productTitle = req.body.newTitle
    const productImage = req.file.path || "https://media.mixbook.com/images/templates/97_1_0_m.jpg";
    const productDescription = req.body.newDescription
    const {
        instagram,
        facebook
    } = req.body;
    const newProduct = new productModel({
        image: productImage,
        title: productTitle,
        description: productDescription
    })
    const id = newProduct._id
    await newProduct.save();

    let productUrl = "https://evening-tor-47612.herokuapp.com/" + "/product/" + id;
    if (facebook == "on") {
        FB.api(
            '/569175147961571/photos',
            'POST', {
            "message": productDescription + '\n' + productUrl,
            "url": productImage
        },
            async function (res) {
                if (!res || res.error) {
                    console.log(!res ? 'error occurred' : res.error);
                    return;
                } else {
                    const postId = res.id //Acesta este id-ul postarii de pe facebook
                    await productModel.findByIdAndUpdate(id, {
                        facebookId: postId
                    }, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                    }).clone();
                }
            }
        );

    }

    if (instagram == "on") {
        FB.api(
            '/17841453033655742/media',
            'POST', {
            "image_url": productImage
        },
            function (res) {
                if (!res || res.error) {
                    console.log(!res ? 'error occurred' : res.error);
                    return;
                } else {
                    const containerId = res.id

                    FB.api(
                        '/17841453033655742/media_publish',
                        'POST', {
                        "creation_id": containerId
                    },
                        async function (response) {
                            if (!res || res.error) {
                                console.log(!res ? 'error occurred' : res.error);
                                return;
                            } else {
                                const mediaId = response.id //Acesta este id-ul postarii de pe instagram
                                await productModel.findByIdAndUpdate(id, {
                                    instagramId: mediaId
                                }, function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                    }
                                }).clone();
                            }
                        }
                    );
                }
            }
        );
    }

    res.redirect("/product/all")
};

module.exports.getProduct = async (req, res) => {
    id = req.params.id;
    const product = await productModel.findById(id).populate({ path: 'comments' });
    const igID = product.instagramId;
    const fbID = product.facebookId;
    let comments = [];
    for (comment of product.comments) {
        comments.push(comment);
        console.log(comment.text)
    }
    if (!fbID && !igID) {
        res.render('../views/product/product', {
            product,
            comments
        }); return;
    }
    if (fbID && igID) {
        FB.api(
            '/' + fbID + '/comments',
            'GET', {},
            function (response) {
                if (!response || res.response) {
                    console.log(!response ? 'error occurred' : response.error);
                    return;
                } else {
                    Object.keys(response).forEach(key => {
                        Object.keys(response[key]).forEach(key1 => {
                            if (response[key][key1].message) comments.push({ text: response[key][key1].message, _id: 0 })
                        })
                    })
                    FB.api(
                        '/' + igID + '/comments',
                        'GET', {},
                        function (response) {
                            if (!response || res.response) {
                                console.log(!response ? 'error occurred' : response.error);
                                return;
                            } else {
                                Object.keys(response).forEach(function (key) {
                                    response[key].forEach(function (a) {
                                        comments.push({ text: a.text, _id: 0 });
                                    })
                                });

                                res.render('../views/product/product', {
                                    product,
                                    comments
                                });
                            }
                        }
                    );


                }
            }
        ); return;
    }
    if (fbID) {
        FB.api(
            '/' + fbID + '/comments',
            'GET', {},
            function (response) {
                if (!response || res.response) {
                    console.log(!response ? 'error occurred' : response.error);
                    return;
                } else {
                    Object.keys(response).forEach(key => {
                        Object.keys(response[key]).forEach(key1 => {
                            if (response[key][key1].message) comments.push({ text: response[key][key1].message, _id: 0 })
                        })
                    })
                }

                res.render('../views/product/product', {
                    product,
                    comments
                });
            }
        ); return;
    }
    FB.api(
        '/' + igID + '/comments',
        'GET', {},
        function (response) {
            if (!response || res.response) {
                console.log(!response ? 'error occurred' : response.error);
                return;
            } else {
                Object.keys(response).forEach(function (key) {
                    response[key].forEach(function (a) {
                        comments.push({ text: a.text, _id: 0 })
                    })
                });
            }

            res.render('../views/product/product', {
                product,
                comments
            });
        }
    );
}
module.exports.deleteProduct = async (req, res) => {
    id = req.params.id;
    await productModel.deleteOne({
        _id: id
    });
    res.redirect("/product/all");
};