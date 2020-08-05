/*Im using Module Pattern with closures and IIFE each module is independent by his self UI Separated from Data
Each on of the modules need to return object by return {.....}
*/

 // Data Controller 
var budgetController = (function (){  
    
    //Function constructors For Expense Items & Income Items
    var Expense = function(id , description ,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };   
    Expense.prototype.eachCalcPercentage = function(){
        if(data.total.inc > 0)
            this.percentage = Math.round((this.value / data.total.inc) * 100);
        else
            this.percentage = -1;
    }     

    var Income = function(id , description ,value){
        this.id = id;
        this.description = description;
        this.value = value;    
    }; 

    function calculateTotal(type){
        var sum = 0;
        for(var i = 0 ; i < data.allItems[type].length ; i++)
            sum+=data.allItems[type][i].value;
        return sum;
    };

    //Data Structure(Object) to store all the data(Expense item , Income item , total exp , total inc//
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1
    }

    return {  //type === exp/inc
        addItem: function(type,desc,val){
            var newItem,ID;
            // Generate new unique ID for each item
            ID = (data.allItems[type].length !== 0) ? data.allItems[type][data.allItems[type].length-1].id + 1 : 0;

            //Create new item based on 'inc' or 'exp' type
            newItem = (type === 'exp') ? new Expense(ID,desc,val) : new Income(ID,desc,val);

            //Push new item into data structure
            data.allItems[type].push(newItem); 

            return newItem;
        },
        removeItem: function(idItem , typeItem){
            var index;
            idItem = parseInt(idItem);
            for(var i = 0 ; i<data.allItems[typeItem].length ; i++)
                if(idItem === (data.allItems[typeItem][i].id)) 
                    index = data.allItems[typeItem].indexOf(data.allItems[typeItem][i]) ;
            
            if (index !== -1)
                data.allItems[typeItem].splice(index , 1);
        },
        calculateBudget: function(){
            data.total.exp = calculateTotal('exp');
            data.total.inc = calculateTotal('inc');
            data['percentage'] = (data['total']['inc'] > 0) ? Math.round((data.total.exp / data.total.inc) * 100) : -1;
            data['budget'] = data.total.inc - data.total.exp;
        },
        calculatePercentages: function(){
            data.allItems['exp'].forEach(function(current){
                current.eachCalcPercentage();
            })
        },
        getAllExpensePercentages: function(){
            var percentArr = data.allItems['exp'].map(function(cur){
                return cur.percentage;
            })
            return percentArr;
        },
        getData: function(){return data;},
        testing: function(){console.log(data);}
    }
})();

// Interface Controller 

var UIController = (function (){   
    // Doing this object if we in future want to change name of the classes in html it make our life better by doing it and not change in the entire code
    var DOMStrings = {                                      
        Type: '.add__type',
        Description: '.add__description',
        Value: '.add__value',
        buttonV: '.add__btn',
        expensesContainer: '.expenses__list',
        incomeContainer: '.income__list',
        Budget: '.budget__value',
        Percentage: '.budget__expenses--percentage',
        IncomeBudget: '.budget__income--value',
        ExpenseBudget: '.budget__expenses--value',
        Container: '.container',
        expPercent: '.item__percentage',
        showMonth: '.budget__title--month'
    }

    return {
        //get inputs from HTML//
        getInput: function(){ 
            return {
                //.value give the input from the field
                type: document.querySelector(DOMStrings.Type).value,        
                description:  document.querySelector(DOMStrings.Description).value,  
                value: parseFloat(document.querySelector(DOMStrings.Value).value) 
            }     
        },

        addListItem: function(obj , type){
            //Create HTML String with placeholder text
            var html , newHTML ,element;
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else{
                element = DOMStrings.expensesContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //Replace the placeholder text with actual data
            newHTML = html.replace('%id%',obj.id);
            newHTML = newHTML.replace('%description%',obj.description);
            newHTML = newHTML.replace('%value%',this.numberFormat(parseInt(obj.value),type));

            //insert the html to the dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
        },
        //function that remove line of expense or income from the DOM  
        removeListItem: function(htmlID){
            var element = document.getElementById(htmlID);
            element.parentNode.removeChild(element);
        },
        eachExpensePercent: function(arr){
            var fields = document.querySelectorAll(DOMStrings.expPercent);
            for(var i = 0 ; i<fields.length ; i++ )
                fields[i].textContent = arr[i] + '%';
            
        },
        //clear description and value fields after each insert
        clearFields: function(){
            var fields,fieldsArr;

            //fields return List
            fields = document.querySelectorAll(DOMStrings.Description + ', ' + DOMStrings.Value); 

            //fieldsArr converter from list to array by using trick of call with fields list - slice its function return copy of array
            fieldsArr = Array.prototype.slice.call(fields);

            //iterate over the arr and clear field by using .value
            for(var i=0 ;i<fieldsArr.length ; i++)
                fieldsArr[i].value = '';

            //Focus in description after insert - its mean the mouse will be at description area after insertion and not in value area 
            fieldsArr[0].focus(); 

        },
        UpdateUI: function(data){
            var budgetSign;
            if(data.budget > 0) budgetSign ="+ " + data.budget;
            else budgetSign = data.budget;
            document.querySelector(DOMStrings.Budget).innerHTML = budgetSign ;
            document.querySelector(DOMStrings.Percentage).innerHTML = (data.percentage !== -1) ? data.percentage + '%' : '---';
            document.querySelector(DOMStrings.IncomeBudget).innerHTML = this.numberFormat(data.total.inc , 'inc');
            document.querySelector(DOMStrings.ExpenseBudget).innerHTML = this.numberFormat(data.total.exp , 'exp');
        },
        numberFormat: function(num,type){
            var intPart,decPart,returnedNumber;
            num = Math.abs(num);
            num = num.toFixed(2);
            num = num.split('.');
            intPart = num[0];
            decPart = num[1];
            if(intPart.length > 3)
                returnedNumber = intPart.substr(0,intPart.length-3) + ',' + intPart.substr(intPart.length-3,intPart.length);
            else
                returnedNumber = num[0];
            return (type === 'exp')? '- ' + returnedNumber + '.' + decPart : '+ ' + returnedNumber + '.' + decPart;
        },
        ShowTheMonth: function(){
            var monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.showMonth).textContent = monthArr[new Date().getMonth()];
        },
        changeType: function(){
            var fields = document.querySelectorAll(DOMStrings.Type + ',' + DOMStrings.Description + ',' + DOMStrings.Value);
            var fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(cur){
                cur.classList.toggle('red-focus');
            })
            document.querySelector(DOMStrings.buttonV).classList.toggle('red');

    
        },
        //Get Access to DOMString object
        getDOMStrings: function(){
            return DOMStrings;
        }
    } 
})();

 // Connect between UI and Data Modules //
var controlCenter = (function(budgetCtrl,UICtrl){ 
    
    function setupEventListeners(){
        document.querySelector(UICtrl.getDOMStrings().buttonV).addEventListener('click',ctrlAddItem);
        //Using addEventLisener directly because keypress on enter is in the global environment of the window
        //event paramter is event from Listener when we push button in our app, im going to check his key code by using console.log and see object KeyCode:13                                                                                                        
        document.addEventListener('keypress',function(event){  
        // its mean Enter pressed keyCode method for normal browser and which methods for older browsers 
        if(event.keyCode === 13 || event.which === 13){                                     
            ctrlAddItem();
            }                                                                                 
        })
        document.querySelector(UICtrl.getDOMStrings().Container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(UICtrl.getDOMStrings().Type).addEventListener('change', UICtrl.changeType)
    }     


    function updateBudget(){
        // 1.Update calculated budget
        budgetCtrl.calculateBudget();
        
        // 2.Update UI with calculated budget
        UICtrl.UpdateUI(budgetCtrl.getData());
    };
    
    function updatePercentages(item){
        budgetCtrl.calculatePercentages();
        UICtrl.eachExpensePercent(budgetController.getAllExpensePercentages()); 
            
    };
    
    function ctrlAddItem(){
        var input,newItem;
        // 1.Get input data from field 
        input = UICtrl.getInput();
        //make sure in description field wrote something and in value field wrote number
        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            // 2.Add item to budget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            // 3.Add item to UI controller
            UICtrl.addListItem(newItem,input.type);
            // 4.Clear fields after each insert
            UICtrl.clearFields();
            //5. Calculate and update budget
            updateBudget();
            //6. Calculate and update the percentages
            updatePercentages(newItem);
        }
    }

    function ctrlDeleteItem(event){
        //getItemID get the unique id of the item from html file
        var getItemID , splitID ,typeItem , idItem;
        getItemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    
        if (getItemID){
            splitID = getItemID.split('-');
            idItem = splitID[1];
            typeItem = splitID [0];
            budgetCtrl.removeItem(idItem,typeItem);
            UICtrl.removeListItem(getItemID);
            updateBudget();
            updatePercentages();
            }


        }

    return { 
        init: function(){
            //reset all fields 
            UICtrl.UpdateUI({
                allItems: {
                    exp: [],
                    inc: []
                },
                total: {
                    exp:0,
                    inc:0
                },
                budget: 0,
                percentage: -1
            })

            UICtrl.ShowTheMonth();
            setupEventListeners();
        }
    }
})(budgetController,UIController);

controlCenter.init();