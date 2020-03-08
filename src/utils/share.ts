import generateUUID from "@/utils/uuid";

class Share {

  private readonly _html: string
  private readonly _key: string

  constructor () {
    this._html = document.documentElement.outerHTML;
    // this._key = generateUUID(6);
    this._key = '123'
  }

  get key() {
    return this._key
  }

  get iv() {
    return btoa(this._key)
  }

  public encodeData() {

  }
}


const share = new Share()

export default share