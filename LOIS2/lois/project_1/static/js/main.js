// Лабораторная работа №2 по дисциплине ЛОИС
// Выполнена студентом группы 021731 БГУИР Шаповалов Д.С.
// -----------------------------------------
// Данный файл реализует проверку формулы на общезначимость:
//
// 01.04.2023
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let button = document.getElementById("button_text_input");
let answer = document.getElementById("answer");
let input = document.getElementById("text_input");

button.addEventListener("click", () => {
    console.log("Go!");
    let value = isFormula(input.value) != false
    console.log(value);
    if(value){
        if(input.value[0] === '1'){
            responseProcessing(true);
        }
        else if(input.value[0] === '0' || (alphabet.split(input.value[0]).length - 1 === 1 )){
            responseProcessing(false);
        }   
        else{
            let data1 = {'dataText': input.value};
            let jsonData = JSON.stringify(data1);
            fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonData
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response received from server:', data);
                responseProcessing((String(data.data).toLocaleLowerCase()));
            })
            .catch(error => {
                console.error('Error sending AJAX request:', error);
            });
        }
    }
    else{
        responseProcessing(false);
    }
});



function responseProcessing(valueAnswer){
    console.log(valueAnswer);
    if(String(valueAnswer) === "Overload".toLowerCase()){
        console.log("Overload");
        answer.innerText = "Overload";
        answer.style.cssText = 
        `
            color: white;
            background-color: #a83636;
            transition: all 0.5s ease;
        `;
    }
    else if(String(valueAnswer) === "true"){
        console.log("True")
        answer.innerText = "True";
        answer.style.cssText = 
        `
            color: white;
            background-color: #36a83a;
            transition: all 0.5s ease;
        `;
    }
    else{
        console.log("False");
        answer.innerText = "False";
        answer.style.cssText = 
        `
            color: white;
            background-color: #a83636;
            transition: all 0.5s ease;
        `;
    }
}


function additionalCharacterCheck(text){
    for(let i = 0; i < text.length; i++){
        if(text[i] === '0'){
            return false;
        }
    }
    
    alphabet.indexOf(text)
    return false;
}

// Проверяет, является ли строка нетерминалом
let isNonTerminal = (value) => {
    return value == "formula" || value == "const" ||
        value == "atom" || value == "complex" || value == "unary" ||
        value == "binary" || value == "letter" || value == "operation";
}

// Проверяет, является ли строка терминалом
let isTerminal = (value) => {
    let result = false;

    for (let i = 0; i <= 26; i ++) {
        result ||= value == String.fromCharCode(i + "A".charCodeAt(0));
    }
    
    const other = [ "(", ")", "\\", "/", "!", "1", "0", "~", "-", ">"];
    
    for (const term of other)
        result ||= value == term;
    
    return result;
}

// Возвращает совокупность всех переходов, возможных из данного нетерминала
let getTransition = (value) => {
    let transition = null;

    if (value == "formula")
        transition = [["const"], ["atom"], ["complex"]];

    else if (value == "complex")
        transition = [["unary"], ["binary"]];

    else if (value == "atom") 
        transition = [["letter"]];

    else if (value == "unary")
        transition = [["(", "!", "formula", ")"]];

    else if (value == "binary")
        transition = [["(", "formula", "operation", "formula", ")"]]

    else if (value == "operation") 
        transition = [["/", "\\"], ["\\", "/"], ["-", ">"], ["~"]]

    else if (value == "letter") {
        transition = [];

        for (let i = 0; i <= 26; i ++) {
            transition.push([String.fromCharCode(i + "A".charCodeAt(0))]);
        }
    }

    else if (value == "const") {
        transition = []

        transition.push(["1"])
        transition.push(["0"])
    }

    return transition;
}

// Получить верхний элемент стека(элемент остается в стеке)
const topElement = (stack) => {
    return stack[stack.length - 1];
}

// Извлечь верхний элемент стека(элемент удаляется из стека)
const pop = (stack) => {
    return stack.pop();
}

// Убрать первую букву строки
const advance = (text) => {
    return text.slice(1, text.length);
}

// Осуществляет грамматический разбор формулы
const isFormula = (text) => {
    let stack = [ "formula" ]; // Помещаем стартовый символ
    let additionalInfo = []; // Данные, используемые для создания времеенной проверки 

    while (stack.length != 0) { // Стек не пуст
        let currentChar = text[0]; // символ строки
        let currentElement = topElement(stack); // X

        if (currentElement == null) { // Встретили эпсилон-переход
            pop(stack);
            continue; // Пропускаем итерацию
        }

        else if (currentElement == currentChar) { // Совпали символ стека и строки
            pop(stack);
            text = advance(text); // Смещаем текст
            continue;
        }

        // story | i, s != i => 
        else if (isTerminal(currentElement)) { // Ошибка 
            if (additionalInfo.length == 0) // Если нет альтернатив, вернуть ошибку
                return false;

            // X -> CD
            let info = pop(additionalInfo); // Получить следующий альтернативный переход

            stack = info[0]; // Восстанавливаем стек
            text = info[1]; // Восстанавливаем текст

            continue;
        }

        // Получить все переходы для текущего нетерминала
        // X -> AB
        // X -> CD
        // [['A', 'B'], ['C', 'D']]
        let transitions = getTransition(currentElement);
        pop(stack);

        // Начать рассматривать первый переход
        let leftTranstion = transitions[0];

        for (let i = 1; i < transitions.length; i ++) { // Сохраняем нерассмотренные переходы
            let tmpStack = stack.slice(); // Создать копию стека
            let currentTranstion = transitions[i]; // Сохраняем нерассмотренный переход

            // console.log(currentTranstion) // Дебаг
            // console.log(currentTranstion.length);

            // X -> CD
            for (let j = currentTranstion.length - 1; j >= 0; j --) // В копию стека помещаем элементы перехода
                tmpStack.push(currentTranstion[j]); // [ ..., D, C]

            additionalInfo.push([tmpStack, text]); // Добавляем все переходы, сохраняем текущее состояние текста
        }

        // X -> AB ['A', 'B']
        // Рассматриваемый выбранный переход
        for (let i = leftTranstion.length - 1; i >= 0; i --)
            stack.push(leftTranstion[i]); // [ ... , B, A ]
    }

    if (text != "")
        return false;

    return true;
}
