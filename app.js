
const commands=[
['/DAY','Bắt đầu vận hành một tiết dạy'],
['/THU-BAI','Thu sản phẩm sau tiết'],
['/DANH-GIA-NHANH','Đánh giá nhanh mức độ tiếp thu'],
['/THU-BAI-CUOI','Thu sản phẩm cuối bài'],
['/CHAM','Hỗ trợ quy trình chấm'],
['/KET-QUA','Tổng hợp kết quả bài học'],
['/PHAN-HOA-ONLINE','Tạo/giao Phiếu A/B/C'],
['/TU-DONG-HOA-50HS','Tự động hóa dữ liệu toàn lớp']
];
const students=[
['10A1.01',7,'B','', 'Chưa đánh giá lại'],
['10A1.02',8,'C',10,'Tiến bộ'],
['10A1.03',4,'A','', 'Chưa đánh giá lại'],
['10A1.04',6,'B','', 'Chưa đánh giá lại'],
['10A1.05',9,'C','', 'Chưa đánh giá lại']
];
const errors=[['MD-KT01',4],['MD-KT03',7],['MD-KT06',12],['MD-KT07',6],['MD-KT08',8]];
const titles={dashboard:'Tổng quan',classes:'Lớp học',lessons:'Bài học',students:'Học sinh',assignments:'Giao bài',analytics:'Phân tích',ai:'Kho AI',records:'Hồ sơ giáo viên'};

function openPage(id){
 document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
 document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));
 document.getElementById(id).classList.add('active');
 document.querySelector(`[data-page="${id}"]`)?.classList.add('active');
 document.getElementById('pageTitle').textContent=titles[id];
}
window.openPage=openPage;
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>openPage(b.dataset.page));

function copyCommand(cmd){
 const text=cmd+'\n10A1 – Bài 1: Mệnh đề';
 navigator.clipboard?.writeText(text);
 const t=document.getElementById('toast'); t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1200);
}
function renderCommands(target,full=false){
 const el=document.getElementById(target); el.innerHTML='';
 commands.forEach(([c,d])=>{
  if(full){let x=document.createElement('article');x.className='command-card';x.innerHTML=`<code>${c}</code><p>${d}</p><button>Sao chép</button>`;x.querySelector('button').onclick=()=>copyCommand(c);el.appendChild(x)}
  else{let b=document.createElement('button');b.className='cmd';b.textContent=c;b.onclick=()=>copyCommand(c);el.appendChild(b)}
 });
}
renderCommands('quickCommands');renderCommands('modalCommands');renderCommands('aiCommands',true);

function renderStudents(q=''){
 const tb=document.getElementById('studentRows');tb.innerHTML='';
 students.filter(s=>s[0].toLowerCase().includes(q.toLowerCase())).forEach(s=>{
  let tr=document.createElement('tr');tr.innerHTML=`<td><b>${s[0]}</b></td><td>${s[1]}</td><td>Phiếu ${s[2]}</td><td>${s[3]||'—'}</td><td><span class="pill">${s[4]}</span></td>`;tb.appendChild(tr)
 });
}
renderStudents();document.getElementById('search').oninput=e=>renderStudents(e.target.value);

const bars=document.getElementById('bars');errors.forEach(([n,v])=>{let x=document.createElement('div');x.className='bar-row';x.innerHTML=`<b>${n}</b><div class="bar"><i style="width:${v/12*100}%"></i></div><span>${v}</span>`;bars.appendChild(x)});

document.getElementById('themeBtn').onclick=()=>document.body.classList.toggle('dark');
document.getElementById('quickBtn').onclick=()=>document.getElementById('modal').classList.add('show');
document.getElementById('closeModal').onclick=()=>document.getElementById('modal').classList.remove('show');
document.getElementById('modal').onclick=e=>{if(e.target.id==='modal')e.currentTarget.classList.remove('show')};
document.getElementById('cmdSearch').oninput=e=>{
 const q=e.target.value.toLowerCase();document.querySelectorAll('#aiCommands .command-card').forEach((x,i)=>x.style.display=(commands[i][0]+' '+commands[i][1]).toLowerCase().includes(q)?'block':'none')
};


const WEB_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSfBMrYbOzc-gT9fxprbxLf6oGyz7uLpdn9m4v8XFBBBvUuWIhrlz9IxKtjGoAh6mdyoPc_3wP3_Kzt/pub?gid=736860123&single=true&output=csv';

function parseSimpleCSV(text){
  const rows = text.trim().split(/\r?\n/).map(line => {
    const out=[]; let cur='', quoted=false;
    for(let i=0;i<line.length;i++) {
      const ch=line[i];
      if(ch==='"') {
        if(quoted && line[i+1]==='"') {cur+='"'; i++;}
        else quoted=!quoted;
      } else if(ch===',' && !quoted) {out.push(cur); cur='';}
      else cur+=ch;
    }
    out.push(cur); return out;
  });
  const data={};
  rows.slice(1).forEach(r=>{ if(r[0]) data[r[0].trim()] = (r[1]??'').trim(); });
  return data;
}
function setText(id,val){const el=document.getElementById(id); if(el) el.textContent=(val===''||val==null)?'—':val;}
async function loadWebData(){
  const st=document.getElementById('webStatus');
  try {
    const res=await fetch(WEB_DATA_URL + '&_=' + Date.now(), {cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const d=parseSimpleCSV(await res.text());
    setText('classLabel', d.LOP || '10A1');
    setText('liveSize', d.SI_SO);
    setText('needHelp', d.HS_CAN_QUAN_TAM);
    setText('liveComplete', d.HOAN_THANH);
    setText('liveProgress', d.TIEN_BO);
    setText('liveReview', d.CAN_XEM_LAI);
    if(st){st.classList.remove('error');st.classList.add('ok');st.innerHTML='<span></span> Google Sheets đã kết nối';}
  } catch(err) {
    console.error(err);
    if(st){st.classList.remove('ok');st.classList.add('error');st.innerHTML='<span></span> Chưa đọc được WEB_DATA';}
  }
}
loadWebData();
setInterval(loadWebData, 60000);
