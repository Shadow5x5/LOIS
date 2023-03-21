// Лабораторная работа №1 по дисциплине ЛОИС
// Выполнена студентом группы 021731 БГУИР Шаповалов Д.С
// -----------------------------------------
// Данный файл реализует проверку формулы СКНФ:
//
// 18.03.2023

field = document.getElementById("formula_text");
btn = document.getElementById("btn_1");
text_1 = document.getElementById("result_text_1");
text_2 = document.getElementById("result_text_2");
text_3 = document.getElementById("result_text_3");

btn.addEventListener("click", () => {
    let time = performance.now();
    let text = field.value;
    let tree = treeBreaking(text);
    //console.log(printList(tree)); 
    console.log(tree);
    text_1.innerHTML = printList(tree);
    let extractedTerms = extractTerms(tree);
    //console.log(printList(extractedTerms));
    text_2.innerHTML = printList(extractedTerms);
    //console.log(checkForCNF(extractedTerms));
    text_3.innerHTML = verificationOfSKNF(extractedTerms);
    time = performance.now() - time;
    console.log('Время выполнения = ', time);
});

const advance = (text) => { // Функция удаление левого символа
    return text.slice(1, text.length);
}

const printList = (list) => { // Дебаг листа
    if (!list) {
        return false;
    }

    let result = '['

    for (let i = 0; i < list.length; i ++) {
        if (Array.isArray(list[i])) 
            result += printList(list[i]);

        else
            result += list[i];

        if (i != list.length - 1)
            result += ', ';
    }

    result += ']';

    return result;
}

const countOfLists = (list) => { // Подсчет списков в списке
    if (! list)
        return false;

    const countOfListsRecursive = (index, count) => {
        if (index == list.length)
            return count;

        else if (Array.isArray(list[index]))
            return countOfListsRecursive(index + 1, count + 1);

        return countOfListsRecursive(index + 1, count);
    }

    return countOfListsRecursive(0, 0);
}

const isEqualLists = (term1, term2) => { // Проверка уникального терма
    if (! Array.isArray(term1) || ! Array.isArray(term2))
        return false;

    else if (term1.length != term2.length)
        return false;

    let result = true;

    for (let i = 0; i < term1.length; i ++)
        result = result && (term2.includes(term1[i]));

    return result;
}

const hasDuplicatedVals = (term) => { //  Проверка на повторяющиеся значения
    if (! term || term.length == 0 || ! Array.isArray(term))
        return undefined;

    let visited = [];

    for (const vart of term) {
        console.log(typeof(term))
        let divided = vart.split(' ');
        let var_to_cmp;
        if(divided.length == 1)
            var_to_cmp = divided[0];
        else
            var_to_cmp = divided[1];
        for (const varv of visited) 
            if (var_to_cmp == varv)
                return true;

        visited.push(vart);
    }

    return false;
}

const extractVars = (term, varList) => { // Вытаскивает все уникальные значения в термах
    for (const vart of term)
        if (! varList.includes(vart)) {
            let divided = vart.split(' ');

            if (divided.length == 1)
                varList.push(vart);

            else
                varList.push(divided[1]);
        }
}

const hasAllVars = (term, varList) => { // Проверка на уникальные значения в тремах
    for (const varl of varList)
      if (! term.includes(varl) && ! term.includes('not ' + varl))
        return false;

    return true;
}

const treeBreaking = (text) => { // Грамматический разбор текста
    const recursiveTreeParsing = (scope, isBraced=false, countOfComplex=0, countOfVars=0, countOfOps=0) => {
     
        if (! isBraced) {

            if (countOfVars > 0 && countOfComplex > 0)
                return false;

            else if (countOfVars > 1)
                return false;

            else if (countOfComplex > 1)
                return false;

            else if (countOfOps > 0)
                return false;
        }

        if (text.length == 0) {     
            if (isBraced)
                return false;

            return scope;
        }

        let ch = text[0];

        if (ch == '(') {
            text = advance(text);
            let result = recursiveTreeParsing([], true)

            if (!result)
                return result;

            scope.push(result);
            return recursiveTreeParsing(scope, isBraced, countOfComplex + 1, countOfVars, countOfOps);
        }

        else if (ch == ')') {

            text = advance(text);

            if (isBraced) {
                if (countOfComplex > 0 && countOfOps == 0)
                    return false;

                else if (countOfComplex + countOfVars > 2)
                    return false;
    
                else if (countOfOps > 1)
                    return false;
            }
            
            if (isBraced && scope.includes('!') && countOfVars + countOfComplex < 1)
                return false;

            else if (isBraced && ! scope.includes('!') && countOfOps > 0 && countOfVars + countOfComplex < 2) {
                return false;
            }

            else if (! isBraced)
                return false;

            else if (scope.length == 0)
                return false;

            return scope;
        }

        else if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(ch)) {
            text = advance(text);

            scope.push(ch);
            return recursiveTreeParsing(scope, isBraced, countOfComplex, countOfVars + 1, countOfOps);
        }

        else {
            if (text.length != 1 && ch == '\\' && text[1] == '/') {
                scope.push('or');
                text = advance(text);
            }

            else if (text.length != 1 && ch == '/' && text[1] == '\\') {
                scope.push('and');
                text = advance(text);
            }

            else if (ch == '!')
                scope.push('!');

            else
                return false;

            text = advance(text);

            return recursiveTreeParsing(scope, isBraced, countOfComplex, countOfVars, countOfOps + 1);
        }

        return false;
    }
    
    return recursiveTreeParsing([]);
}

const extractTerms = (parseTree) => { // Извлекает из полученного дерева разбора термы
    if (! parseTree)
        return false;

    let extractTermsRecursive = (currentTerm, isNegated=false, isDisjuncted=false) => {
        let result = []

        if (! Array.isArray(currentTerm)) {

            return [currentTerm];
        }

        let negated = false;
        let disjuncted = false;
        let conjuncted = false;

        if (currentTerm.includes('!'))
            negated = true;

        else if (currentTerm.includes('or'))
            disjuncted = true;

        else if (currentTerm.includes('and'))
            conjuncted = true;

        if (isDisjuncted && conjuncted || isNegated && negated || isNegated && currentTerm.length > 1)
            return false;

        for (const term of currentTerm) {
            if (term == 'or' || term == 'and' || term == '!')
                continue;

            let extracted = extractTermsRecursive(term, negated, disjuncted);

            if (!extracted)
                return false;

            else if (negated)
                extracted = 'not ' + extracted;

            if (conjuncted && countOfLists(extracted) == 0) 
                result.push(extracted);

            else
                result = result.concat(extracted);
        }
    
        return result;
    }

    let result = extractTermsRecursive(parseTree); 

    if (result && countOfLists(result) == 0) 
        return [result];

    return result;
}

const verificationOfSKNF = (terms) => { // Проверка на скнф
    if (!terms)
        return false;
        
    let visited = [];
    let varList = [];

    for (const term of terms) {
        if (visited.length == 0) {
            visited.push(term);
            extractVars(term, varList);
            continue;
        }

        for (const visitedTerm of visited) {
            if (isEqualLists(visitedTerm, term))
                return false;
        }

        extractVars(term, varList);
        console.log(typeof(term))
        visited.push(term);
    }

    for (const term of visited) {
        if (hasDuplicatedVals(term))
            return false;

        else if (! hasAllVars(term, varList))
            return false;
    }

    return true;
}



