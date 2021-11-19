/**
 * Brute force hashed text that follows a Sequential Pattern\
 * 
 * Hashed method:
 *   - HMAC_SHA256("key", "The quick brown fox jumps over the lazy dog")
 */

var app = require('express')();
var http = require('http').Server(app);
// var io = require('socket.io')(http);
var { Server } = require('socket.io');
const io = new Server(http);

var port = process.env.PORT || 3000;


var events = require('events');
var eventEmitter = new events.EventEmitter();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
  setTimeout(function(){
    bruteforce();
  }, 3000);
  
});

io.on('connection', (socket) => {
    // console.log('a user connected');
  });

eventEmitter.on('logging', function(message) {
  io.emit('log_message', message + '\n');
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

// Override console.log
var originConsoleLog = console.log;
console.log = function(data) {
  eventEmitter.emit('logging', data);
  originConsoleLog(data);
};

function bruteforce() {
    var crypto = require('crypto');
    const phrase = 'beware of Greeks bearing gifts'
    const UVCIS = [ 'EL00011', 'EL00021', 'EL0003', 'EL00014'];
    console.log('\n\n');
    console.log('Phrase and UVCIs');
    console.log('================');
    console.log('Phrase: ' + phrase);
    console.log('UVCIs: ' + JSON.stringify(UVCIS, null, 2));
    // Hash all the UVCIs with a phrase as a key.
    let key = phrase;
    const hashedUVCIs = UVCIS.map(uvci => crypto.createHmac('sha256', key).update(uvci).digest("base64"))
    console.log('\n\n');
    console.log('Hashed UVCIs');
    console.log('============');
    console.log('HMAC_SHA256(phrase, uvci)')
    console.log(JSON.stringify(hashedUVCIs, null, 2));
    
    // Hash the phrase with the UVCIs as a key.
    const hashedPhrase = UVCIS.map(uvci => crypto.createHmac('sha256', uvci).update(key).digest("base64"))
    console.log('\n\n');
    console.log('Hashed Phrases');
    console.log('==============');
    console.log('HMAC_SHA256(uvci, phrase)')
    console.log(JSON.stringify(hashedPhrase, null, 2));
    
    // Crack it. 
    // Assumptions
    //    - We know the phrase
    //    - The UVCIs we are looking for are following a Sequential Pattern
    let index = 0;
    const prefix = 'EL000';
    
    // Brure force the hashed UVCIs
    console.log('\n\n\n');
    console.log('=== Brute force the hashed UVCIs. ===')
    console.log('HMAC_SHA256(uvci, phrase)\n\n')
    let cracked;
    do {
        // 1. Create a probe UVCI
        const probeUVCI = prefix + index;
        console.log(`Probing ${probeUVCI} ...`);
        console.log(`HMAC_SHA256(${probeUVCI}, PHRASE)`)
        // 2. Hash the probe UVCI
        const straw = crypto.createHmac('sha256', phrase).update(probeUVCI).digest("base64")
        // 3. Search for the hashed probe into the list with hashes.
        cracked = hashedUVCIs.find( e => {
            return e === straw
        });
        // 4. If found display it. 
        if (!!cracked) {        
            console.log(`!!! UVCI found ${probeUVCI} !!!!\n\n\n`);
        } else {
            console.log('Not in the list.\n')
        }
        index++;
    } while (!cracked && index < 10)
    
    // Brure force the hashed Phrases
    console.log('=== Brute force the hashed phrases. ===')
    console.log('HMAC_SHA256(phrase, uvcis)\n\n')
    index = 0;
    cracked = null;
    do {
        // 1. Create a probe UVCI
        const probeUVCI = prefix + index;
        console.log(`Probing ${probeUVCI} ...`);
        console.log(`HMAC_SHA256(PHRASE, ${probeUVCI})`)
        // 2. Hash the phrase with the probe UVCI as a key.
        const straw = crypto.createHmac('sha256', probeUVCI).update(phrase).digest("base64")
        // 3. Search for the hashed probe into the list with hashed phrases.
        cracked = hashedPhrase.find( e => {
            return e === straw
        });
        // 4. If found display it. 
        if (!!cracked) {
            console.log(`!!! UVCI found ${probeUVCI} !!!!\n\n\n`);
        } else {
            console.log('Not in the list.\n')
        }
        index++;
    } while (!cracked && index < 10)
    // let test = crypto.createHmac('sha256', "key").update("json").digest("base64");
    // console.log(test) 
}
