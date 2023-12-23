const ErrorHandler = require("../utils/errorhandeler");
const tryCatchAsync = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const { use } = require("../routes/userRoute");

//Register a User

exports.registerUser = tryCatchAsync(async (req, res, body) => {

    const { name, email, username, password } = req.body;

    const user = await User.create({
        name, email, username, password,
        avatar: {
            public_id: "avatars/vmm6atlfk5rodxbvxf3y",
            url: "https://res.cloudinary.com/dre2ungrh/image/upload/v1700682134/avatars/vmm6atlfk5rodxbvxf3y.png"
        }
    });

    sendToken(user, 201, res);
})

//Login a User

exports.loginUser = tryCatchAsync(async (req, res, next) => {

    const { emailOrUsername, password } = req.body;
    // Checking if user has given both email/username and password
    if (!emailOrUsername || !password) {
        return next(new ErrorHandler("Please Enter Email/Username and Password", 400));
    }
    const user = await User.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Inavlid email or password", 401));
    }

    sendToken(user, 201, res);

})


//Logout User

exports.logout = tryCatchAsync(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "User logged out successfully"
    })

});

//Forgot Password

exports.forgotPassword = tryCatchAsync(async (req, res, next) => {
    const { emailOrUsername } = req.body;
    if (!emailOrUsername) {
        return next(new ErrorHandler("Please Enter Email/Username", 400));
    }
    const user = await User.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
        return next(new ErrorHandler(`No account with ${emailOrUsername}`, 400));
    }

    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Click on bellow url to reset your password:- \n\n ${resetPasswordUrl} \n\n If you have not requested for password reset then please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password reset`,
            message: message
        });

        res.status(200).json({
            success: true,
            meesage: `mail sent to ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

//Reset Password
exports.resetPassword = tryCatchAsync(async (req, res, next) => {
    //from req.params.token ,the token we got is not hashed but in database we have stored hashed token, so we will hash it with same algo we have used while hashing and storing into database.......here "sha256" is algo we have used in both place
    const passwordResetToken = crypto.createHash("sha256").update(req.params.token).digest("hex"); // hashed token
    const user = await User.findOne({
        resetPasswordToken: passwordResetToken,
        resetPasswordExpire: { $gt: Date.now() } //checking that resetPasswordExpire is grater than current time
    });

    if (!user) {
        return next(new ErrorHandler("Reset password url is invalid or has been expired", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    //password will be save in bcryct format cause in User Schema we have made a pre event before saving....check userModel.jd in models folder for detail
    await user.save();

    sendToken(user, 200, res);
});

// Get User Detail

exports.getProfileDetails = tryCatchAsync(async (req, res, next) => {
    const user = await User.findOne({ _id: req.user.id }) //While login we have set user details into req.user..for more detail see auth.js in middleware folder
    res.status(200).json({
        success: true,
        user
    });
});

//Change Password

exports.changePassword = tryCatchAsync(async (req, res, next) => {
    const user = await User.findOne({ _id: req.user.id }).select("+password") //While login we have set user details into req.user..for more detail see auth.js in middleware folder
    const { oldPassword, newPassword } = req.body;
    if (! await user.comparePassword(oldPassword)) {
        return next(new ErrorHandler("Kindly enter correct old password", 400));
    };

    user.password = newPassword;
    await user.save(); // in userModel.js in models folder...we have created an event before save method for bcrypt password then save
    sendToken(user, 200, res);
});

//Update user details

exports.updateProfile = tryCatchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler(`No account with userId= ${req.user.id}`, 400));
    }

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        username: req.body.username
    };
    if (req.body.avatar !== "") {
        const imageId = user.avatar.public_id;
        if (imageId !== "avatars/vmm6atlfk5rodxbvxf3y") {
            await cloudinary.v2.uploader.destroy(imageId);
        }
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });
        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }

    const newuser = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        message: "Profile updated",
        newuser
    })
});

//Get all user (admin)

exports.getAllUser = tryCatchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    });
});

//Get single user (admin)

exports.getUser = tryCatchAsync(async (req, res, next) => {
    const user = await User.findById({ _id: req.params.id });
    if (!user) {
        return next(new ErrorHandler(`No user exist with ${req.params.id}`, 400));
    }
    res.status(200).json({
        success: true,
        user
    });
});

//Delete User (admin) 

exports.deleteUser = tryCatchAsync(async (req, res, next) => {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
        return next(new ErrorHandler(`No user exist with ${req.params.id}`, 400));
    }
    const imageId = user.avatar.public_id;
    if (imageId !== "avatars/vmm6atlfk5rodxbvxf3y") {
        await cloudinary.v2.uploader.destroy(imageId);
    }
    await user.deleteOne({ _id: req.params.id })
    res.status(200).json({
        success: true,
        message: "User removed successfully"
    });
});


//Update User details (admin)

exports.updateUserDetails = tryCatchAsync(async (req, res, next) => {
    const { name, email, username, role } = req.body;
    const user = await User.findById(req.params.id)
    if (!user) {
        return next(new ErrorHandler(`No user exist with ${req.params.id}`, 400));
    }
    user.name = name;
    user.email = email;
    user.username = username;
    user.role = role;
    //we will add cloudnary later for avatar
    await user.save();
    res.status(200).json({
        success: true,
        message: "User profile updated successfully"
    })
});

exports.addToCart = tryCatchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler("No account found with this id", 400));
    }
    const existingCartItemIndex = user.cart.findIndex(item => item.productId.toString() === req.body.productId);
    if (existingCartItemIndex != -1) {
        user.cart[existingCartItemIndex].quantity += req.body.quantity;
    } else {
        user.cart.push({ productId: req.body.productId, quantity: req.body.quantity });
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Product added to cart successfully"
    });
});


exports.addMultipleToCart = tryCatchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new ErrorHandler("No account found with this id", 400));
    }
    const products = req.body.products;
    products.forEach((item) => {
        const existingCartItemIndex = user.cart.findIndex(cartItem => cartItem.productId.toString() === item.productId.toString())
        if (existingCartItemIndex !== -1) {
            user.cart[existingCartItemIndex].quantity += item.quantity;
        } else {
            user.cart.push({ productId: item.productId, quantity: item.quantity });
        }
    });
    await user.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
        message: "All Product added to cart successfully"
    });
})

exports.getAllCartItems = tryCatchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler("No account found with this id", 400));
    }

    const cartItems = await Promise.all(user.cart.map(async (item) => {
        const productDetail = await Product.findById(item.productId.toString());
        const newItem = {
            id: item.productId.toString(),
            image: productDetail.images[0],
            name: productDetail.name,
            price: productDetail.price,
            ratings: productDetail.ratings,
            quantity: item.quantity,
            stock: productDetail.stock
        }
        return newItem;
    }));


    res.status(200).json({
        success: true,
        cartItems: cartItems,
        message: "All cart items sent successfully"
    })
})

exports.cartQuantityIncOrDecByOne = tryCatchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    const cartItemIndex = user.cart.findIndex(cartItem => cartItem.productId.toString() === req.body.productId.toString())
    if (req.body.type === "+") {
        user.cart[cartItemIndex].quantity += 1;
    } else {
        user.cart[cartItemIndex].quantity -= 1;
    }

    await user.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
        message: "Cart quantity changed successfully"
    })

})

exports.cartRemove = tryCatchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    const cartItemIndex = user.cart.findIndex(cartItem => cartItem.productId.toString() === req.body.productId)

    const numberOfElementsToRemove = 1;

    if (cartItemIndex !== -1) {
        user.cart.splice(cartItemIndex, numberOfElementsToRemove);
    }

    await user.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
        message: "Item removed from cart successfully"
    })
})

exports.clearCart = tryCatchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler("No account found with given id", 400));
    }

    user.cart = [];

    await user.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
        message: "All items removed from cart successfully"
    })
})


