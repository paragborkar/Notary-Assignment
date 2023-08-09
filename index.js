import mysql from "mysql";
import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import { Query } from "mongoose";


dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());


export const con = mysql.createConnection({
  host: `${process.env.HOST}`,
  user: `${process.env.DBUSER}`,
  password: `${process.env.DBPASS}`,
  database:`${process.env.DBNAME}`
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.listen(process.env.PORT,()=>{
  console.log(`Server Is Listening On Port ${process.env.PORT}`);
})

app.post('/getStatusCount', (req, res) => {
    const uid = req.body.uid;
  
    const query = `
      SELECT
        c.uid,
        COUNT(*) AS TotalCandidates,
        SUM(CASE WHEN cs.status = 'joined' THEN 1 ELSE 0 END) AS Joined,
        SUM(CASE WHEN cs.status = 'interview' THEN 1 ELSE 0 END) AS Interview
      FROM Candidate c
      LEFT JOIN Candidate_Status cs ON c.id = cs.cid
      WHERE c.uid = ?
      GROUP BY c.uid;
    `;
  
    con.query(query, [uid], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        if (result.length === 0) {
          res.status(404).json({ error: 'User not found' });
        } else {
          res.status(200).json(result[0]);
        }
      }
    });
});

// TO Create Database Use The Below Query
// CREATE DATABASE notary;


// For Creating User Table Use The Below Query
// CREATE TABLE User(
//     id INT PRIMARY KEY,
//     name VARCHAR(20) NOT NULL
// );


// For Creating Candidate Table Use Below Query
// CREATE TABLE Candidate (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     uid INT,
//     candidateName VARCHAR(20) NOT NULL,
//     CONSTRAINT fk_user FOREIGN KEY (uid) REFERENCES User(id)
// );


// For Creating Candidate_Status Table User Below Query
// CREATE TABLE Candidate_Status (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     cid INT,
//     status VARCHAR(10),
//     statusUpdatedAt DATE,
//     CONSTRAINT fk_candidate FOREIGN KEY (cid) REFERENCES Candidate(id),
//     CONSTRAINT chk_status CHECK (status IN ('joined', 'interview'))
// );


//Payload
// {
//     "uid":4
// }

//Response
// {
//     "uid": 4,
//     "TotalCandidates": 3,
//     "Joined": 2,
//     "Interview": 1
// }