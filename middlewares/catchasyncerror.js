export const catchasyncerrors = (thefunction) =>{
    return (req,res,next) =>{
        Promise.resolve(thefunction(req,res,next)).catch(next);
    };
};

