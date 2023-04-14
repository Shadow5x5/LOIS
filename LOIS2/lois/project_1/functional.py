# Лабораторная работа №2 по дисциплине ЛОИС
# Выполнена студентом группы 021731 БГУИР Шаповалов Д.С.
# --------------------------------------------------------
# Данный файл реализует проверку формулы на общезначимость:
#
# 01.04.2023

import numpy as np
import string


#  #Создаем массив со всеми возможными сочетаниями значений переменных
# for n in range(1,27):
#     truth_table = np.zeros((2**n, n), dtype=bool)
#     for i in range(2**n):
#         for j in range(n):
#             truth_table[i][j] = bool(i & (2**(n-j-1)))
#     np.save(f"truthTable{n}", truth_table)



def valueSeacrh(Dict1, Dict2, Dict3, Array1, Array2, key):
    if key in Dict1:
        return Array1[Dict1.get(key)]
    elif key in Dict2:
        return Array2[Dict2.get(key)]
    else:
        return bool(Dict3.get(key))  


def checkFunction(expression):
    expression = expression.replace("\\/", "+")
    expression = expression.replace("/\\", "*")
    expression = expression.replace("->", "&")
    text = text2 = expression
    text2 = sorted(set(text2))
    uppercase_letters = []
    variable_indexing_dict_2 = {}
    variable_indexing_dict_3_const_true_false = {"0": 0, "1": 1}
    for char in text2:
        if char.isupper() and char in string.ascii_uppercase:
            uppercase_letters.append(char)
    if(len(uppercase_letters) > 15):
        return "Overload"
    variable_indexing_dict = {letter: index for index, letter in enumerate(uppercase_letters)}
    
    if(len(variable_indexing_dict)):
        sizeTruthTable = len(variable_indexing_dict)
    else:
        sizeTruthTable = 1

    data = np.load(f"D:/Job/LOIS2/lois/project_1/truthTableFolder/truthTable{sizeTruthTable}.npy")
    data_2 = []
    sizeTable = len(data)
    stack = []

    def checkFormula():
        for i in range(sizeTable):
            counter = 0
            data_3 = []
            for symbol in text:
                if(symbol == '('):
                    stack.append(symbol)
                elif(symbol == ')'):    
                    tempText = []
                    while(len(stack) > 0):
                        if(stack[len(stack) - 1] == '('):
                            tempText.reverse()
                            value = True
                            stack.pop()
                            if(tempText[0] == '!'):
                                value = not(valueSeacrh(variable_indexing_dict, variable_indexing_dict_2, variable_indexing_dict_3_const_true_false, data[i], data_3, tempText[1]))
                            elif(tempText[1] == '+'):
                                left_value = valueSeacrh(variable_indexing_dict, variable_indexing_dict_2, variable_indexing_dict_3_const_true_false, data[i], data_3, tempText[0])
                                right_value = valueSeacrh(variable_indexing_dict, variable_indexing_dict_2, variable_indexing_dict_3_const_true_false, data[i], data_3, tempText[2])
                                value = left_value or right_value
                            elif(tempText[1] == '*'):
                                left_value = valueSeacrh(variable_indexing_dict, variable_indexing_dict_2, variable_indexing_dict_3_const_true_false, data[i], data_3, tempText[0])
                                right_value = valueSeacrh(variable_indexing_dict, variable_indexing_dict_2, variable_indexing_dict_3_const_true_false, data[i], data_3, tempText[2])
                                value = left_value and right_value
                            elif(tempText[1] == '&'):
                                left_value = valueSeacrh(variable_indexing_dict, variable_indexing_dict_2, variable_indexing_dict_3_const_true_false, data[i], data_3, tempText[0])
                                right_value = valueSeacrh(variable_indexing_dict, variable_indexing_dict_2, variable_indexing_dict_3_const_true_false, data[i], data_3, tempText[2])
                                if(left_value == True and right_value == False):
                                    value = False
                                else:
                                    value = True
                            elif(tempText[1] == '~'):
                                left_value = valueSeacrh(variable_indexing_dict, variable_indexing_dict_2, variable_indexing_dict_3_const_true_false, data[i], data_3, tempText[0])
                                right_value = valueSeacrh(variable_indexing_dict, variable_indexing_dict_2, variable_indexing_dict_3_const_true_false, data[i], data_3, tempText[2])
                                value = left_value == right_value
                            stack.append(f"val{counter}")
                            variable_indexing_dict_2[f"val{counter}"] = counter
                            data_3.append(value)
                            counter +=1
                            tempText.clear()
                            break
                        else:
                            tempText.append(stack.pop())
                else:
                    stack.append(symbol)
            data_2.append(data_3)
            stack.clear()
            if(data_2[-1][-1] == False):
                return False
        return True
    
    return checkFormula()


