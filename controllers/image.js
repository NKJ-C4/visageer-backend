const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key "+ process.env.API_CLARIFAI);

const handleClarifaiApi = (req, res) => {
    stub.PostModelOutputs(
        {
            // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
            model_id: "face-detection",
            inputs: [{data: {image: {url: req.body.input}}}]
        },
        metadata,
        (err, response) => {
            if (err) {
                console.log("Error: " + err);
                return res.status(400).json("Unable to fetch");
            }
    
            if (response.status.code !== 10000) {
                console.log("Received failed status: " + response.status.description + "\n" + response);
                return res.status(400).json("Unable to fetch");
            }
            return res.json(response)
        }
    );
}
  
const addUserEntries = (db) => (req, res) => {
    const { id } = req.body;
    db('users')
        .where('id', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries)
        })
        .catch(err => res.status(400).json('Unable to fetch the entries'))
}

module.exports = {
    addUserEntries: addUserEntries,
    handleClarifaiApi: handleClarifaiApi
}