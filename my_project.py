from flask_sqlalchemy import SQLAlchemy
from flask import Flask, render_template 
from flask import jsonify, request
from flask_moment import Moment
import datetime
import os
from flask import Flask, render_template, request, redirect, url_for, send_from_directory



app = Flask(__name__)           
app.secret_key = "secret key"
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:nanda10201@localhost/f_blog'
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_EXTENSIONS'] = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
db = SQLAlchemy(app)
moment = Moment(app)

class F_blog(db.Model):                       
    entry = db.Column(db.String(1000), unique=True, nullable=False)
    created_at = db.Column(db.DateTime(1000), nullable=False)
    updated_at = db.Column(db.DateTime(1000),  nullable=True)
    image_url = db.Column(db.String(1000), nullable=True)
    id = db.Column(db.Integer(), primary_key=True, nullable=False, autoincrement=True)
    
    def __init__(self, entry):  
        self.entry = entry
        self.created_at = datetime.datetime.now()
        self.updated_at = datetime.datetime.now()
              

@app.route('/project/')          
def list_entries():
    print(F_blog);
    entries = F_blog.query.order_by(F_blog.id.desc())      
    return render_template('main.html', entries = entries)


@app.route('/project', methods=['POST'])
def add_entry():
    entry_info = request.form
    entry = entry_info['entry']
    print(entry)

    if entry == ""  :
        return jsonify({"message": "failed!"}), 400
    else:
        new_entry = F_blog(entry = entry)
        db.session.add(new_entry) 
        db.session.commit()
        return jsonify({"message": "success", "id": new_entry.id, "updated_at" : new_entry.updated_at, "created_at" : new_entry.created_at}), 200

@app.route('/project/<int:id>', methods=['DELETE']) 
def delete_entry(id): 
    entry = F_blog.query.get(id)
    if entry.image_url:
        filename = os.path.join(app.root_path, entry.image_url)
        os.remove(filename)
    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "success"}), 200

@app.route('/project/<int:id>', methods=['PUT'])
def edit_entry(id): 
    present_entry = request.form
    edited_entry = present_entry['entry']
    print(edited_entry)

    if edited_entry == ""  :
        return jsonify({"message": "failed!"}), 400
    else:
        entry = F_blog.query.get(id)
        entry.entry = edited_entry
        entry.updated_at = datetime.datetime.now()
        db.session.commit()
        return jsonify({"message": "success", "id": entry.id, "updated_at": entry.updated_at}), 200


@app.route('/upload', methods=['POST'])
def upload():
    id = request.form['id']
    file = request.files['data']
    filename = request.form['filename']
    
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename + id)
    file.save(filepath)
    entry = F_blog.query.get(id)
    entry.image_url = filepath
    db.session.commit()

    return jsonify({"message": "success"}), 200

@app.route('/project/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename) 

if __name__ == '__main__':    
    app.run(debug=True)  


