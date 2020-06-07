const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}

const connectDB = async () => {
  try {
    await mongoose.connect(db, options)
    console.log('mongo db connected')
  } catch (error) {
    console.error(error.message)

    // exit process with failure
    process.exit(1)
  }
}

module.exports = connectDB
