// contenedor simulacion
const $simulation = document.querySelector('.simulation-container');
//conetenedor radiobuttons objetivo
const $containerRadio = document.querySelector('#container-radios');
const $goalParagraph = document.querySelector('#goal-ren');
const $goal = document.getElementsByName('goal');
//años de inversión
const $yearsParagraph = document.querySelector('#years-ren');
const $yearsRange = document.querySelector('#years');
//Aporte inicial
const $initial = document.querySelector('#initial');
const $monthly = document.querySelector('#monthly');
//Perfil
const $profile = document.querySelector('#profile');
//Alerta de mensaje
const $alert = document.querySelector('#alert');
//Boton calcular
const $buttonCal = document.querySelector('#btn-cal');

//renderiza los años que escoge el usuario
$yearsRange.addEventListener('input', (e)=>{
    $yearsParagraph.textContent = `${e.target.value} años`;
});



// contenedor de las simulaciones del portafolio del usuario
const $simulationContainer = document.querySelector('.user-simulations');

//Variable que guarda el valor del objetivo del usuario.
let goal = '';
let profile;
let investSimulation;






//pasos de la simulación
let step = 0;

$buttonCal.addEventListener('click', (e)=>{
    //previene el comportamiento por defecto del boton
    e.preventDefault();


    //si hay montos ingresados
    if($initial.value && $monthly.value){

        //se asigna el valor del perfil del usuario
        profile = $profile.value;
        
        //si no hay goal
        if(!goal){
            $containerRadio.classList.add('hiden-container');
            $containerRadio.classList.remove('container-block');
            document.querySelector('.user-simulations-container').classList.remove('hiden-container');
            $simulation.classList.remove('hiden-container');
            goal = userGoalRadio($goal);
            //muestro en el formulario el objetivo del usuario
            $goalParagraph.textContent = `${goal}`;
            let userGoal = goal;
            investSimulation = new portfolio(userGoal);
            investSimulation.addSimulation(step);
            // console.log(investSimulation.dbPortfolio);
            renderSimulation();
            $simulationContainer.appendChild(investSimulation.getHTML(investSimulation.dbPortfolio.length - 1,step));
            step++;

            
        }else{
            //si ya hay goal
            investSimulation.addSimulation(step);
            renderSimulation();
            $simulationContainer.appendChild(investSimulation.getHTML(investSimulation.dbPortfolio.length - 1,step));
            step++;

        }
        // console.log(investSimulation.dbPortfolio);
        // console.log(investSimulation);
        clearForm();
    }else{
        $alert.textContent = 'Debes ingresar todos los campos!'
    } 

}); 

//funcion que retorna el objetivo del usuario
const userGoalRadio = (input)=>{
    
    for(let i = 0; i < input.length; i++ ){
        if(input[i].checked){
            $yearsParagraph.textContent = `${input[i].value}`
            
            return input[i].value;
            
        }
    }
}

//funcion que limpia el formulario
const clearForm = () =>{
    $yearsRange.value = '1';
    $yearsParagraph.textContent = '1 año';
    $alert.textContent = '';
    $initial.value = '';
    $monthly.value = '';

}

//remover la tarjeta de la simulación del DOM
$simulationContainer.addEventListener('click', (e)=>{
    let element = e.target.parentElement.classList.value;
    //let a = document.querySelector(`.${element}`)

    console.log("value"+element.substring(element.indexOf("-")+1),element.length);
    investSimulation.removeSimulation(element.substring(element.indexOf("-")+1),element.length);
        // if(e.target && e.target.nodeName === 'BUTTON'){
        
    //     investSimulation.removeSimulation(step-1);
    // }
});

// pinta los resultados en el DOM
const renderSimulation = () =>{
    for(let i = 0; i < investSimulation.dbPortfolio.length; i++){
        document.querySelector('#result-years').textContent = `En ${$yearsRange.value} años podrías tener`;
        document.querySelector('#result-realistic').textContent = `$${investSimulation.dbPortfolio[i].returns[0].at(-1)}`;
        document.querySelector('#result-total').textContent = `$${investSimulation.dbPortfolio[i].totalAmount}`;
        document.querySelector('#result-optimistic').textContent = `$${investSimulation.dbPortfolio[i].returns[1].at(-1)}`;
        document.querySelector('#result-pessimistic').textContent = `$${investSimulation.dbPortfolio[i].returns[2].at(-1)}`;
    }
}


/*Este array de objeto contiene los datos para crear el fondo de inversión
del usuario. Esto será un JSON local más adelante, sería genial si fuera una API*/
const FUNDS = [
    {
        name: 'Ned Flanders - Conservative',
        currency: 'CLP',
        period: 'monthly',
        optimistic: 0.0113,
        realistic: 0.0085,
        pessimistic: 0.0049
    },
    {
        name: 'Lisa Simpson - Moderative',
        currency: 'CLP',
        period: 'monthly',
        optimistic: 0.0129,
        realistic: 0.0092,
        pessimistic: 0.0041
    },
    {
        name: 'Edna Krabappel - Risky',
        currency: 'CLP',
        period: 'monthly',
        optimistic: 0.015,
        realistic: 0.011,
        pessimistic: 0.0044
    },
];

//Guardo en el local storage todos los fondos para realizar la simulacion. 
//Esto lo hago porque hipoteticamente podría tener problemas con la petición de los fondos cuando haga otra simulación
//mejor los tengo en local storage. 
localStorage.setItem('funds', JSON.stringify(FUNDS));
//recupero los fondos del local storage
const localFunds = JSON.parse(localStorage.getItem('funds'));



/* Está clase crea el objeto fund con la data del "JSON" según el perfil 
de inversión del usuario. Tiene un método que entrega los retornos esperados
del fondo*/ 
class fund {
    constructor(name, currency, period, optimistic, realistic, pessimistic){
        this.name = name;
        this.currency = currency;
        this.period = period;
        this.optimistic = optimistic;
        this.realistic = realistic; 
        this.pessimistic = pessimistic;
    }
    /*Este método recibe los años de inversión del usuario, el monto inicial y el aporte mensual. Luego aplica
    el cálculo de retorno esperado para los tres escenarios existentes: realistic, optimistic y pessimistic.
    El método devuelve un array con 3 arrays que tienen los retornos mensuales del periodo de inversión para los
    escenarios realistic, optimistic y pessimistic. */
    expectedReturns(years, initialAmount, monthlyAmount){
  	    const MONTHS = years * 12;
        let interests = [this.realistic, this.optimistic, this.pessimistic];
        const EXPECTED_RETURNS = [];
        interests = interests.map((el)=>{
            const TOTAL = [];
            for(let i = 1; i <= MONTHS; i++){
                let sum = 0;
                sum += Math.round(initialAmount* Math.pow((1 + el), i));
                
                for(let j = 0; j<i; j++){
                    sum += Math.round(monthlyAmount * Math.pow((1 + el), j));
         
                }
                TOTAL.push(sum);
                sum = 0;
                
            }

            EXPECTED_RETURNS.push(TOTAL);

        });

 		
        return EXPECTED_RETURNS;
       
    }
};

/*La clase portfolio crea el objeto portfolio que tiene como propiedades el objetivo y la dbPortfolio (que sería como el carrito de compras
en los ecommerces) donde se guardan los objetos simulation que crea el usuario. El método addSimulation llama a las funciones que se encargan
de pedir los datos a los usuarios y validarlos. También crea una nueva una nueva instancia de la clase simulation y la pushea
al dbPortfolio. El método removeSimulation elimina una simulación del dbPortfolio */
class portfolio {
    constructor(goal){
        this.goal = goal;
        this.dbPortfolio = [];
    }

    addSimulation(step){
        let userProfile = profile;

        let userYearsInvest = parseInt($yearsRange.value);

        let initialUserAmount = parseInt($initial.value);

        let monthlyUserAmount = parseInt($monthly.value);

        //indice para crear el fund del usuario
        let index = userProfile;
          
        this.dbPortfolio.push(new simulation(userYearsInvest,initialUserAmount,monthlyUserAmount,index,step));
    }
    removeSimulation(item){
        this.dbPortfolio = this.dbPortfolio.reduce((acc,el,i)=>{
            if(el.id != item){
                acc.push(el);
            }
            return acc;
            
        },[]);
        console.log(this.dbPortfolio);
        document.querySelector('.card-container-'+item).remove();
        
        
    }
    //Método que pinta en el DOM las tarjetas con la información de la simulación
    getHTML(i,step){
        let node;
        let html = `
                    <div class="card card-${step}">
                        <div class="info-card">
                            <div class="left-card"> 
                                <div>
                                    <p>En</p>
                                    <p>${this.dbPortfolio[i].years} años</p>
                                </div>
                                <div>
                                    <p>Inicias con</p>
                                    <p>$${this.dbPortfolio[i].initialAmount}</p>
                                </div>
                            </div>
                            <div class="rigth-card">
                                <p>Se espera que tengas</p>
                                <p>$${this.dbPortfolio[i].returns[0].at(-1)}</p>
                            </div>
                        </div>
                        <p id="fund-name">${this.dbPortfolio[i].fundName}</p>
                        <button class="remove-btn">Eliminar</button>
                    </div>
        `;
        node = document.createElement('div');
        node.classList.add('card-container-'+step); 
        node.classList.add('card-container');
        node.innerHTML = html;
        return node;


    }
}


/* la clase simulation crea el objeto simulation que utiliza los datos que vienen del método addSimulation de la class portfolio
para instanciarse. Dentro de este objeto se crea una instancia de la clase fund y utiliza su método expectedReturns para obtener
los retornos esperados de la inversión del usuario */
class simulation{
    constructor(years, initialAmount, monthlyAmount, indexFund, id){
        this.fundName = localFunds[indexFund].name;
        this.years = years;
        this.initialAmount= initialAmount;
        this.monthlyAmount = monthlyAmount;
        let newFund = new fund (localFunds[indexFund].name, localFunds[indexFund].currency, localFunds[indexFund].period, localFunds[indexFund].optimistic, localFunds[indexFund].realistic, localFunds[indexFund].pessimistic );
        this.returns= newFund.expectedReturns(years, initialAmount, monthlyAmount);
        this.totalAmount = ((years * 12 ) * monthlyAmount) + initialAmount;
        this.id = id;
    }
}






    
