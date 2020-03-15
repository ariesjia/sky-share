import generateUUID from './uuid'
import { decryptFile } from "@/utils/crypto";


export const upload = (blob: Blob, name:  string) => {
  var formData = new FormData();
  const uuid = generateUUID(8)
  formData.append('file', blob);
  const filename = name;
  return fetch(`https://siasky.net/skynet/skyfile/${uuid}?filename=${filename}`, {
    method: 'POST',
    body: formData
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      return result
    })
}

export const download = (skylink: string, key: string, filename:string) : Promise<any> => {
  return fetch(`https://siasky.net/${skylink}`, {
    method: 'GET',
  }).then((response) => {
    if(!response.ok) {
      throw new Error(`${response.status}`)
    }
    return response
  }).then(async (response) => {
    const blob = await response.blob();
    const { headers } = response;
    const disposition = headers.get('content-disposition');
    console.log(disposition);
    const name = disposition ? decodeURIComponent(disposition.split('=')[1]) : filename;
    console.log(name);
    return decryptFile(
      blob,
      key,
      name
    )
  })
}

