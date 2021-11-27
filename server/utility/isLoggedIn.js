function isLoggedIn(request, response, done) {
    if (request.user) {
       return done();
    }
    
    response.status(401).send();
 };
export {isLoggedIn};