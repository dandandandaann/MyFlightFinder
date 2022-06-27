# My Flight Finder

Pequeno projeto para me ajudar encontrar passagens baratas!
Disponível no [GitHub Pages](https://dandandandaann.github.io/MyFlightFinder/) do projeto.

### TODO list:

- fix airport inputs not being considered for second update
- re generate calendar when date change
- fix next month arrows
- add dropdowns to select airports (https://interline.tudoazul.com/catalog/api/v1/airport?searchAirport=Paris)
- show some 'loading...' hint in UI
- add some delay to prevent multiple requests with small interval
- Have inputs in a separate component?
- Save calendar in a local variable and use it to fill it

- ##### Figure out how to sumarize multiple requests in the calendar
    - have an unique id for each day and update each day separately by id?
    - make a class 'bind' it to each day?
    - have three separate method
        1. to request and parse the data to a common class
        2. queue calendar updates if it's busy  
        3. update the calendar