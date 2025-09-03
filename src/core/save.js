const KEY='mpwa-save-v2';
export const Save={ read(){ try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return{};} }, write(obj){ localStorage.setItem(KEY,JSON.stringify(obj)); } };