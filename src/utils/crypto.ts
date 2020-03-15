import { saveAs } from 'file-saver';

//declarations
const DEC = {
  signature: "c2t5bmV0IGNyeXB0byBzaGFyZQ==",
  hash: "SHA-512",
  algoName1: "PBKDF2",
  algoName2: "AES-GCM",
  algoLength: 256,
  itr: 80000,
  salt: window.crypto.getRandomValues(new Uint8Array(16)),
  perms1: ["deriveKey"],
  perms2: ['encrypt', 'decrypt'],
}


//better function to convert string to array buffer
//as done in the webcrypto documentation
function toArrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

//import key
// import the entered key from the password input
function importSecretKey(password: string) {
  const rawPassword = toArrayBuffer(password)
  // @ts-ignore
  return window.crypto.subtle.importKey(
    "raw", //raw
    rawPassword, // array buffer password
    {
      name: DEC.algoName1
    }, //the algorithm you are using
    false, //whether the derived key is extractable
    DEC.perms1 //limited to the option deriveKey
  );
}


async function deriveEncryptionSecretKey(password: string) { //derive the secret key from a master key.
  const getSecretKey = await importSecretKey(password);
  return window.crypto.subtle.deriveKey({
      name: DEC.algoName1,
      salt: DEC.salt,
      iterations: DEC.itr,
      hash: {
        name: DEC.hash
      },
    },
    getSecretKey, //your key from importKey
    { //the key type you want to create based on the derived bits
      name: DEC.algoName2,
      length: DEC.algoLength,
    },
    false, //whether the derived key is extractable
    DEC.perms2 //limited to the options encrypt and decrypt
  )
}

function processFinished(name: string, data: BlobPart[]) {
  return new Blob(data, {
    type: 'application/octet-stream'
  });
}

//file encryption function
export async function encryptFile(file: File, password: string) : Promise<Blob> {
  const derivedKey = await deriveEncryptionSecretKey(password); //requiring the key
  const fr = new FileReader(); //request a file read
  return new Promise((resolve, reject) => {
    fr.onload = async () => { //load
      const iv = window.crypto.getRandomValues(new Uint8Array(16)); //generate a random iv
      // @ts-ignore
      const content = new Uint8Array(fr.result); //encoded file content
      // encrypt the file
      await window.crypto.subtle.encrypt({
        iv,
        name: DEC.algoName2
      }, derivedKey, content)
        .then(function (encrypted) {
          //returns an ArrayBuffer containing the encrypted data
          resolve(
            processFinished(
              'Encrypted-' + file.name,
              [window.atob(DEC.signature), iv, DEC.salt, new Uint8Array(encrypted)],
            )
          );
        })
    }
    //read the file as buffer
    fr.readAsArrayBuffer(file)
  });
}


export async function decryptFile(blob: Blob, password:string, filename:string) {
  const fr = new FileReader(); //request a file read
  return new Promise((resolve, reject) => {
    fr.onload = async () => { //load
      async function deriveDecryptionSecretKey() { //derive the secret key from a master key.
        const getSecretKey = await importSecretKey(password);
        return window.crypto.subtle.deriveKey({
            name: DEC.algoName1,
            // @ts-ignore
            salt: new Uint8Array(fr.result.slice(19+16, 19+16+16)), //get salt from encrypted file.
            iterations: DEC.itr,
            hash: {
              name: DEC.hash
            },
          },
          getSecretKey, //your key from importKey
          { //the key type you want to create based on the derived bits
            name: DEC.algoName2,
            length: DEC.algoLength,
          },
          false, //whether the derived key is extractable
          DEC.perms2 //limited to the options encrypt and decrypt
        )
      }
      const derivedKey = await deriveDecryptionSecretKey(); //requiring the key
      // @ts-ignore
      const iv = new Uint8Array(fr.result.slice(19, 19+16)); //take out encryption iv
      // @ts-ignore
      const content = new Uint8Array(fr.result.slice(19+16+16)); //take out encrypted content
      return window.crypto.subtle.decrypt({
        iv,
        name: DEC.algoName2
      }, derivedKey, content)
        .then(function (decrypted) {
          console.log(decrypted);
          const decryptBlob = new Blob([new Uint8Array(decrypted)],
            {type: 'application/octet-stream'})
          const name = (filename||'').replace(/\"$/, '').replace(/^\"/, '');
          console.log(name);
          saveAs(decryptBlob, name);
          resolve();
        },(e) => {
          reject()
          console.log(e);
        })
    }
    fr.readAsArrayBuffer(blob) //read the file as buffer
  });
}