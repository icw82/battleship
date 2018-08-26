// Если True, то выводит отладочные сообщения в консоли.
const DEBUG = true;

//const routes = []

const app = {}
DEBUG && console.log(`app`, app);

app.players = new Players();
app.games = new Games();
app.fields = new Fields();

app.state = new State();
app.actions = new Actions();
app.view = new View();


// E V E N T S
{
    const buttons = document.querySelectorAll(`button[action]`);

    buttons.forEach(button => {
        button.addEventListener(`click`, () => {
            app.actions[button.getAttribute(`action`)]();
        });
    });
}

app.view.update();
