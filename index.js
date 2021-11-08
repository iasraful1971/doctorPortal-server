const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');


const port = process.env.PORT || 5000;





//middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zhekc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res , next){
    if(req?.headers?.authorization?.startsWith('Bearer')){
        const token =req.headers.authorization.split(' ')[1];
        try {
                const decodedUser = await admin.auth().verifyIdToken(token);
                req.decodedEmail = decodedUser.email;

        }
        catch{

        }
    }
    next();

}
async function run() {
try {
    await client.connect();
    const database = client.db('doctors_portal-main');
    const appointmentsCollection = database.collection('appointments');
    const usersCollection = database.collection('users')


        //get
       app.get('/appointments', async (req, res) => {
        const email = req.query.email;
        const date = new Date(req.query.date).toLocaleDateString();
        const query = { email: email, date: date }
        const cursor = appointmentsCollection.find(query);
        const appointments = await cursor.toArray();
        res.json(appointments);
    });

        //post
        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            console.log(result);
            res.json(result)
        });
        //user post
        app.post('/users'  , async (req ,res) => {
            const user= req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
            console.log('the result' , result);
        });

       
        // user put
        app.put('/users', async (req , res) => {
            const user =req.body;  
            const filter = {email : user.email }
            const options  = {upsert: true} ;
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter , updateDoc, options);
            res.json(result);

    });
//make admin
    app.put('/users/admin',  async (req ,res) => {
        const  user = req.body; 
        const filter  = {email: user.email};
        const updateDoc = {$set: {role: 'admin'}}
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
        console.log('the result' , result);
    })



}
finally {
    // await client.close();
}
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hey Doctors portal!')
})

app.listen(port, () => {
    console.log(`hey hey doc ${port}`)
})
