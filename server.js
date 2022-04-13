const Express = require("express");
const app = new Express();

app.use(Express.static("./public"));

app.get('/', (req, res) => {
    res.sendFile("./index.html", {root: "."});
});

app.listen(3000, () => console.log("App started on 3000"));