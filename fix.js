const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('d:/Invoice management/backend/invoice_management.db');
db.serialize(() => {
    ['CompanyLogo', 'BankName', 'BankAccountNumber', 'BankIfscCode', 'UpiId', 'AuthorizedSignature'].forEach(col => {
        db.run("ALTER TABLE Setting ADD COLUMN " + col + " TEXT", err => {
            if (err) console.log(col, err.message);
            else console.log(col, 'added');
        });
    });
});
db.close();
