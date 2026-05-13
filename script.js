// KIA Modellari ma'lumotlar bazasi
const cars = [
    { id: 1, name: "KIA K5", price: 385000000, img: "https://avatars.mds.yandex.net/get-autoru-vos/2161763/1e46419f75d415f66904723cafdddd7e/1200x900" },
    { id: 2, name: "KIA Sportage", price: 460000000, img: "https://i.ytimg.com/vi/zxkw415B5x0/maxresdefault.jpg" },
    { id: 3, name: "KIA Seltos", price: 325000000, img: "https://ci.encar.com/carpicture10/pic4200/42000969_003.jpg" },
    { id: 4, name: "KIA Carnival", price: 780000000, img: "https://storage.yandexcloud.net/storage.bips.ru/uploads/kia/carnival/6411/ByOAsOMV.jpg" },
    { id: 5, name: "KIA EV6 (Electric)", price: 820000000, img: "https://avatars.mds.yandex.net/get-vertis-journal/4080458/60630f3e3604fb5dbf970d38.jpg_1649852823376/orig" },
    { id: 6, name: "KIA Sonet", price: 215000000, img: "https://avatars.mds.yandex.net/i?id=134733fd9bd52ca2265ba47d84029622dec9b4bc-5233605-images-thumbs&n=13" }
];

let selectedCar = cars[0];
let currentMode = 'cash'; // cash, credit, nasiya

// Modellarni ekranga chiqarish
function init() {
    const grid = document.getElementById('carGrid');
    cars.forEach(car => {
        const card = document.createElement('div');
        card.className = `car-card ${car.id === 1 ? 'active' : ''}`;
        card.innerHTML = `
            <img src="${car.img}" alt="${car.name}">
            <h4>${car.name}</h4>
            <p>${car.price.toLocaleString()} UZS</p>
        `;
        card.onclick = () => selectCar(car, card);
        grid.appendChild(card);
    });
    calculate();
}

function selectCar(car, el) {
    selectedCar = car;
    document.querySelectorAll('.car-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('selectedCarImg').src = car.img;
    document.getElementById('selectedCarName').innerText = car.name;
    calculate();
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.toLowerCase().includes(mode)) btn.classList.add('active');
    });
    calculate();
}

function calculate() {
    const prepaymentPercent = document.getElementById('prepaymentRange').value;
    document.getElementById('prepaymentValue').innerText = prepaymentPercent + "%";
    
    const months = parseInt(document.getElementById('period').value);
    const carPrice = selectedCar.price;
    
    let monthly = 0;
    let total = carPrice;
    let annualRate = 0;

    if (currentMode === 'cash') {
        monthly = 0;
        total = carPrice;
        document.getElementById('calcInputs').style.opacity = '0.3';
        document.getElementById('calcInputs').style.pointerEvents = 'none';
    } else {
        document.getElementById('calcInputs').style.opacity = '1';
        document.getElementById('calcInputs').style.pointerEvents = 'all';

        // Stavkalar (O'zbekiston banklaridan namuna)
        annualRate = (currentMode === 'credit') ? 0.24 : 0.15; // Kredit 24%, Nasiya 15% (ustama)
        
        const prepaymentAmount = carPrice * (prepaymentPercent / 100);
        const loanAmount = carPrice - prepaymentAmount;
        
        if (currentMode === 'credit') {
            // Bank krediti (Annuitet)
            const r = annualRate / 12;
            monthly = loanAmount * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
            total = (monthly * months) + prepaymentAmount;
        } else {
            // Nasiya (Oddiy ustama)
            total = carPrice + (loanAmount * annualRate);
            monthly = (total - prepaymentAmount) / months;
        }
    }

    document.getElementById('resPrice').innerText = carPrice.toLocaleString() + " UZS";
    document.getElementById('resMonthly').innerText = Math.round(monthly).toLocaleString() + " UZS";
    document.getElementById('resTotal').innerText = Math.round(total).toLocaleString() + " UZS";
}

window.onload = init;
// Tugmani topamiz va unga bosish hodisasini biriktiramiz
document.querySelector('.order-btn').addEventListener('click', downloadContract);

function downloadContract() {
    // 1. PDF uchun ma'lumotlarni to'ldiramiz
    const date = new Date().toLocaleDateString();
    const carName = document.getElementById('selectedCarName').innerText;
    const totalPrice = document.getElementById('resTotal').innerText;
    const monthlyPrice = document.getElementById('resMonthly').innerText;
    
    let modeText = "Naqd to'lov";
    if (currentMode === 'credit') modeText = "Bank krediti (24%)";
    if (currentMode === 'nasiya') modeText = "Muddatli to'lov (18%)";

    // 2. Shablondagi joylarga ma'lumotlarni yozamiz
    document.getElementById('pdf-date').innerText = date;
    document.getElementById('pdf-car-name').innerText = carName;
    document.getElementById('pdf-total-price').innerText = totalPrice;
    document.getElementById('pdf-monthly').innerText = monthlyPrice;
    document.getElementById('pdf-payment-type').innerText = modeText;

    // 3. PDF generatsiya qilish sozlamalari
    const element = document.getElementById('contract-template');
    element.style.display = 'block'; // Vaqtincha ko'rinadigan qilamiz

    const opt = {
        margin:       10,
        filename:     `KIA_Shartnoma_${carName}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 4. PDF-ni yaratish va yuklab olish
    html2pdf().set(opt).from(element).save().then(() => {
        element.style.display = 'none'; // Yuklab bo'lingach yana yashiramiz
    });
}