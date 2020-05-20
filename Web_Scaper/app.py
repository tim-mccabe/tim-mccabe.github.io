import pymongo
from flask_cors import CORS
from flask import Flask, jsonify

#establish mongo connection
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["Golf_db"]["golf"]

app = Flask(__name__)

@app.route("/json_data")
def json_data():
    data = list(db.find({}, {"_id": False}))
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
