getInput('Enter mode (encrypt, dycrypt) - (1 , 2): ', (mode)=>{
    if(mode == '1'){
        getInput('Enter the file location: ', (fileLocation)=>{
            console.log(`Opening file '${fileLocation}'...`);
            openFile(fileLocation, (fileData)=>{
                const status = fileData.status ? 'Success' : `${fileData.message}. Quitting`;
                console.log(`File opened with status: ${status}.`);
        
                if(!fileData.status){
                    return;
                }
        
                const fileContent = fileData.data;
                const ip = getIP()[0];
                const data = ip+'|'+encrypt(fileContent).match(/.{1,5}/g)+'|127.0.0.1';
        
                writeToFile(data, fileLocation, (status)=>{
                    if(status.status){
                        console.log('Finshed!');
                    } else{
                        console.log(status.message+'. Quitting.');
                        return;
                    }
                });
                return;
            });
            return;
        })
    } else if(mode == '2'){
        getInput('Enter the file location: ', (fileLocation)=>{
            console.log(`Opening file '${fileLocation}'...`);
            openFile(fileLocation, (fileData)=>{
                const status = fileData.status ? 'Success' : `${fileData.message}. Quitting`;
                console.log(`File opened with status: ${status}.`);
        
                if(!fileData.status){
                    return;
                }
        
                const fileContent = fileData.data;
                const ip = getIP()[0];
                const data = decrypt((fileContent.split('|')[1]?.trim() || '').split(',').join(""));
        
                writeToFile(data, fileLocation, (status)=>{
                    if(status.status){
                        console.log('Finshed!');
                    } else{
                        console.log(status.message+'. Quitting.');
                        return;
                    }
                });
                return;
            });
            return;
        })
    } else{
        console.log('Error: Invalid type');
    }
})

/**
 * Asks for an input from the user 
 * 
 * @param {String} title - What you wish to ask the user
 * @param {Function} callback - The function that should be ran with the user input as the first param
 */
function getInput(title, callback){
    const readline = require('node:readline');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
      
    rl.question(title, (userInput) => {
        rl.close();
        callback(userInput);
    });
}

let key = 'B:K!R(lLvp]}f=.<BpOthJz_6$ev#<g+';

/**
 * Encrypts a string
 * 
 * @param {String} text - The text to encrypt
 * @return {String} The text in encrypted form
 */
function encrypt(text){
    const crypto = require('node:crypto');
    const iv = crypto.randomBytes(16); // Generate a random initialization vector
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + encrypted;
}

/**
 * Decrypts a string
 * 
 * @param {String} text - The text to encrypt
 * @return {String} The text in decrypted form
 */
function decrypt(text) {
    const crypto = require('node:crypto');
    const iv = Buffer.from(text.slice(0, 32), 'hex');
    const encrypted = text.slice(32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * Returns the content of a file
 * 
 * @param {String} location - The location of the file
 * @param {Function} callback - The function that should be ran with the data as the first param with satus and message / data deppening on the returned status
 */
function openFile(location, callback){
    const fs = require('node:fs');

    fs.readFile(location, 'utf8', (err, data) => {
        if(err) {
            callback({status: 0, message: err});
            return;
        }
        callback({status: 1, data: data});
    });
}

/**
 * Writes to a file
 * 
 * @param {String} content - The content of the file
 * @param {String} location - The location of the file
 * @param {Function} callback - The function that should be ran when it's finished writting. Status is returned in first param
 */
function writeToFile(content, location, callback){
    const fs = require('node:fs');

    fs.writeFile(location, content, function(err) {
        if(err) {
            callback({status: 0, message: err});
            return;
        }
        callback({status: 1});
    });
}
/**
 * Get IP
 * 
 * @return {String} Returns the IP adress
 */
function getIP(){
    const os = require('node:os');
    const networkInterfaces = os.networkInterfaces();
    
    const ipv4 = Object.values(networkInterfaces)
        .flat()
        .filter(interface => interface.family === 'IPv4' && !interface.internal)
        .map(interface => interface.address);

    return ipv4;
    
}