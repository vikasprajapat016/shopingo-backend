import User from "../models/userModel.js"
import Products from "../models/productModel.js"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"

export const signUp = async(req, res, ) =>{
    console.log("user on signup")
  const {username, email, password, role } = req.body || {};

  if(!username || !email || !password || !role) {
    console.log(req.body)
    return res.status(400).json({
        success:false,
        message: "All fields are required !"
    } );

  }

 try {
    const existingUser = await User.findOne({email}); 
    if(existingUser) {
        return res.status(409).json({
            success:false,
            message:"User already exists !"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

      const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
        })

        await newUser.save()

        res.status(201).json({
            success: true,
            message : "User created successfully !" ,
            user: {
                id : newUser._id,
                name: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        })


 } catch (err) {
    res.status(500).json({
        success:false,
        message: "server error",
        error: err.message
    })
    console.log(err)
 }
}




export const signIn = async(req, res) => {

    try {
    const {email, password,} = req.body || {}

    if (!email || !password) {
        return res.status(400).json({
            success:false,
            message: "Please fill all details"})
    }

    
        const user = await User.findOne({email})
        if(!user) {
          return res.status(404).json({
            success: false,
            message: "User not found!"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch) {
           return res.status(401).json({
            success: false,
            message: "Wrong credentials"})
        }

        const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "1d"},
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite:"lax",
            maxAge: 24*60*60*1000
        })

        

        res.status(200).json({
            success: true,
            message: "Login successfull",
            user: {
                id: user._id,
                username: user.username,
                email:user.email,
                role: user.role
            }

        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        }
        );
        
    }
};


export const logout = (req, res) => {
  try {
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      });
    res.status(200).json({
        success: true,
        message: "User logout successfully"
    })
  } catch (error) {
    res.status(500).json({
        success: false,
        message: "Error accured"
    })
  }
}


export const saveProducts = async (req , res) => {
    try {
        console.log("hello")
        const response = await fetch("https://dummyjson.com/products?limit=194")
         const data = await response.json()
         console.log(data)

           await Products.insertMany(data.products)

         res.status(200).json({
            message: "products fetched and inserted",
            totalProducts: data.products.length
         })

          console.log("products added to databse successfully")
    } catch (error) {
        res.status(400).json({
            message: " error accured"
        ,err: error})
    }
}