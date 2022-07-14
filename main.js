const mealsEl = document.querySelector('.meals');
const favoriteContainer = document.querySelector('.fav-meals');
const searchTerm = document.querySelector('#search-term');
const searchBtn = document.querySelector('#search');
const mealInfoEl = document.querySelector('.meal-info');
const mealPopup = document.querySelector('#meal-popup');
const popupCloseBtn = document.querySelector('.close-popup');
getRandomMeal(); 
fetchFavMeals();

async function getRandomMeal(){
    const request = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const requestData = await request.json();
    const randomMeal = requestData.meals[0];

    console.log(requestData);
    addMeal(randomMeal, true);
}

async function getMealById(id){
   const request = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
   const response = await request.json();
   const meal = response.meals[0];

   return meal;
}

async function getMealsBySearch(term){
    const request = await fetch(
        "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
    );

    const response = await request.json();
    const meals = response.meals;

    return meals; 
}

function addMeal(mealData, random = false){
    const meal =document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
            <div class="meal-header">
            ${random ?`<span class="random">
                        Random Recipe
                    </span>
                ` : ''}
                    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
                </div>
                <div class="meal-body">
                    <h4>${mealData.strMeal}</h4>
                    <button><i class="fa-solid fa-heart"></i></button>
            </div>`;


    const btn = meal.querySelector('.meal-body button');
    btn.addEventListener('click', (e)=>{
        if(btn.classList.contains('active')){
            removeMealLS(mealData.idMeal);
            btn.classList.remove('active');
        }else{
            addMealLS(mealData.idMeal);
            btn.classList.toggle('active');
        }
        fetchFavMeals();
        meal.innerHTML = '';
        getRandomMeal();
    });
    meal.addEventListener('click', ()=>{
        showMealInfo(mealData);
    })

    mealsEl.appendChild(meal);           
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem(
        "mealIds",
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    );
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals(){
    favoriteContainer.innerHTML='';

    const mealIds = getMealsLS();

    for(let i=0; i<mealIds.length; i++){
        const mealId = mealIds[i];
        let meal = await getMealById(mealId);
        addMealFav(meal);
    }
}

function addMealFav(mealData){

    const favMeal =document.createElement('li');

    favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" 
    alt="${mealData.strMeal}">
    <span>${mealData.strMeal}</span>
    <button><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector('button');
    btn.addEventListener('click', ()=>{
        removeMealLS(mealData.idMeal);
        fetchFavMeals();
    });

    favMeal.addEventListener('click', ()=>{
        showMealInfo(mealData);
    });

    favoriteContainer.appendChild(favMeal);           
}

searchBtn.addEventListener('click', async ()=>{
    mealsEl.innerHTML = '';
    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    if(meals){
        meals.forEach((meal)=>{
            addMeal(meal);
        });
    }
});

function showMealInfo(mealData){
    mealInfoEl.innerHTML = '';

    const ingredients = [];
    for(let i=1; i<21; i++){
        if(mealData['strIngredient' + i]){
            ingredients.push(`${mealData["strIngredient" +i]} - ${mealData["strMeasure" + i]}`);
        }else{
            break;
        }
    }
    console.log(ingredients);

    const mealEl = document.createElement('div');
    mealInfoEl.appendChild(mealEl);
    mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <p>${mealData.strInstructions}</p>
    <h3>Ingredients: </h3>
    <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
    `

    mealPopup.classList.remove('hidden');
}

popupCloseBtn.addEventListener('click', ()=>{

    mealPopup.classList.add('hidden');
});