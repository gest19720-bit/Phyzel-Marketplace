window.PhyzelValidation={required(value,label){return value.trim()?null:`${label} is required`},email(value){return /^\S+@\S+\.\S+$/.test(value)?null:'Enter a valid email address'}};
