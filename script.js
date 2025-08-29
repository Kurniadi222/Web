const ACC_KEY="vs_acc", LOGIN_KEY="vs_login", ORD_KEY="vs_orders";
let orders = JSON.parse(localStorage.getItem(ORD_KEY)) || [];
let currentUser = JSON.parse(localStorage.getItem(LOGIN_KEY)) || null;
let signupMode=false;
const hargaMap={Sea1:7000,Sea2:5000,Sea3:3000};

// Pastikan akun admin ada
(function(){let acc=JSON.parse(localStorage.getItem(ACC_KEY))||[];if(!acc.some(a=>a.user==="admin")){acc.push({user:"admin",pass:"12345",role:"admin"});localStorage.setItem(ACC_KEY,JSON.stringify(acc));}})();

function toggleInput(id){let el=document.getElementById(id);el.type=el.type==="password"?"text":"password";}

// Toggle Sign Up / Login
document.getElementById("toggleSignup").onclick=()=>{signupMode?exitSignupMode():enterSignupMode();};
function enterSignupMode(){signupMode=true;document.getElementById("loginTitle").textContent="Sign Up";document.getElementById("confirmBox").classList.remove("hidden");document.getElementById("authBtn").textContent="Sign Up";document.getElementById("loginError").style.display="none";}
function exitSignupMode(){signupMode=false;document.getElementById("loginTitle").textContent="Login";document.getElementById("confirmBox").classList.add("hidden");document.getElementById("authBtn").textContent="Login";document.getElementById("loginError").style.display="none";}

// Login / Sign Up
document.getElementById("authBtn").onclick=function(){
  const u=document.getElementById("loginUser").value.trim();
  const p=document.getElementById("loginPass").value;
  const c=document.getElementById("loginConfirm").value;
  if(!u||!p||(signupMode&&!c)){alert("Isi semua field!");return;}
  let acc=JSON.parse(localStorage.getItem(ACC_KEY))||[];
  if(signupMode){
    if(p!==c){alert("Password tidak cocok!");return;}
    if(acc.some(a=>a.user===u)){alert("Username sudah dipakai!");return;}
    acc.push({user:u,pass:p,role:"user"});
    localStorage.setItem(ACC_KEY,JSON.stringify(acc));
    alert("Akun berhasil dibuat! Silakan login.");exitSignupMode();return;
  }
  const user=acc.find(a=>a.user===u && a.pass===p);
  if(!user){document.getElementById("loginError").style.display="block";return;}
  currentUser=user;
  localStorage.setItem(LOGIN_KEY,JSON.stringify(user));
  showMain();
}

function showMain(){
  document.getElementById("loginPage").style.display="none";
  document.getElementById("mainPage").classList.remove("hidden");
  showPage('home');
  renderOrders();
}

function logout(){
  localStorage.removeItem(LOGIN_KEY);
  location.reload();
}

function showPage(p){
  document.querySelectorAll(".page").forEach(pg=>pg.style.display="none");
  document.getElementById(p).style.display="block";
}

// Update harga otomatis
function updateHarga(){
  const j=document.getElementById("jenisJoki").value;
  document.getElementById("hargaJoki").textContent=j?`Harga: Rp ${hargaMap[j]}`:'';
}

// Update avatar Roblox
function updateAvatarPreview(){
  const username=document.getElementById("username").value.trim();
  const img=document.getElementById("avatarPreview");
  if(!username){img.style.display="none";return;}
  fetch(`https://api.roblox.com/users/get-by-username?username=${username}`)
  .then(r=>r.json())
  .then(data=>{
    if(data && data.Id){
      img.src=`https://www.roblox.com/headshot-thumbnail/image?userId=${data.Id}&width=100&height=100&format=png`;
      img.style.display="block";
    }else{img.style.display="none";}
  });
}

// Form Order
document.getElementById("jokiForm").addEventListener("submit",function(e){
  e.preventDefault();
  const u=document.getElementById("username").value.trim();
  const p=document.getElementById("password").value;
  const j=document.getElementById("jenisJoki").value;
  const pay=document.getElementById("pembayaran").value;
  const f=document.getElementById("bukti").files[0];
  if(!u||!j||!pay||!f){alert("Lengkapi data!");return;}
  const reader=new FileReader();
  reader.onload=function(ev){
    orders.unshift({user:currentUser.user,username:u,password:p,jenis:j,pembayaran:pay,bukti:ev.target.result,status:"Tahap"});
    localStorage.setItem(ORD_KEY,JSON.stringify(orders));
    alert("Order terkirim!");
    e.target.reset();
    document.getElementById("avatarPreview").style.display="none";
    renderOrders();
  }
  reader.readAsDataURL(f);
});

// Render Status Joki
function renderOrders(){
  const list=document.getElementById("orderList");
  list.innerHTML="";
  if(!orders.length){document.getElementById("noOrders").textContent="Belum ada order";return;}
  document.getElementById("noOrders").textContent="";
  orders.forEach((o,i)=>{
    const div=document.createElement("div");
    div.className="order-item";
    // Judul Jokian
    const judul=document.createElement("h3");
    judul.textContent=`Jokian ${i+1}`;
    div.appendChild(judul);
    // Avatar Roblox
    const img=document.createElement("img");
    img.src=o.avatar || o.bukti || "https://www.roblox.com/headshot-thumbnail/image?userId=1&width=100&height=100&format=png";
    img.style.width="50px";
    img.style.height="50px";
    img.style.borderRadius="50%";
    div.appendChild(img);
    // Info
    const info=document.createElement("div");
    const cls=o.status==="Proses"?"Proses":(o.status==="Done"?"Done":"Tahap");
    info.innerHTML=`<b>${o.username}</b><br>Jenis: ${o.jenis}<br>Pembayaran: ${o.pembayaran}<br>Status: <span class="status ${cls}">${o.status}</span>`;
    div.appendChild(info);
    // Tombol admin
    if(currentUser.role==="admin"){
      const btnDiv=document.createElement("div");btnDiv.className="order-buttons";
      const btnProses=document.createElement("button");btnProses.textContent="Proses";btnProses.onclick=()=>updateStatus(i,"Proses");
      const btnDone=document.createElement("button");btnDone.textContent="Done";btnDone.onclick=()=>updateStatus(i,"Done");
      const btnHapus=document.createElement("button");btnHapus.textContent="Hapus";btnHapus.onclick=()=>hapusOrder(i);
      btnDiv.appendChild(btnProses);btnDiv.appendChild(btnDone);btnDiv.appendChild(btnHapus);
      div.appendChild(btnDiv);
    }
    list.appendChild(div);