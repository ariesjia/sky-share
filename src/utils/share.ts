import generateUUID from "@/utils/uuid";
import {upload} from "@/utils/skynet";

class Share {

  private readonly _html: string
  private readonly _key: string

  constructor () {
    this._html = document.documentElement.outerHTML;
    // @ts-ignore
    this._key = window.SHARE_CODE;
  }

  get key() {
    return this._key
  }

  get iv() {
    return btoa(this._key)
  }

  get link() {
    return location.href
  }

  public fork() {
    const html = this._html.replace(
      /<script>window.SHARE_CODE=.*<\/script>/,
      '<script>window.SHARE_CODE="'+generateUUID()+'"<\/script>'
    );
    var blob = new Blob([html], { type: 'text/html' });
    return upload(blob, 'share.html').then((res) => {
      location.href = `https://siasky.net/${res.skylink}`
    })
  }
}


const share = new Share()

export default share