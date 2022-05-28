# My Flight Finder

Pequeno projeto para me ajudar encontrar passagens baratas!
Disponível no [GitHub Pages](https://dandandandaann.github.io/MyFlightFinder/) do projeto.

### TODO list:

- add dropdowns to select airports (probably use smiles search api)
- show some 'loading...' hint in UI
- hide LocalOnly checkbox when not local
- add some delay to prevent multiple requests with small interval

- ##### Figure out how to sumarize multiple requests in the calendar
    - have an unique id for each day and update each day separately by id?
    - make a class 'bind' it to each day?
    - have three separate method
        1. to request and parse the data to a common class
        2. queue calendar updates if it's busy  
        3. update the calendar
