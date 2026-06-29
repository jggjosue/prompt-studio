const jobs = [
  {company:"Mercor",type:"Hourly contract",cat:"Generalist",title:"AI Training — Software Engineering Expert",location:"Remote",mode:"Asynchronous",hours:"20–40 hrs/week",rate:"$55–$110",tags:["Software Engineering","Python","System Design"]},
  {company:"Mercor",type:"Hourly contract",cat:"Engineering",title:"Senior Backend Engineer (LLM Evaluation)",location:"Remote",mode:"Asynchronous",hours:"30 hrs/week",rate:"$70–$95",tags:["Go","PostgreSQL","Distributed Systems"]},
  {company:"Mercor",type:"Hourly contract",cat:"Data",title:"Data Annotator — Mathematics",location:"Remote",mode:"Asynchronous",hours:"15–25 hrs/week",rate:"$40–$60",tags:["Mathematics","LaTeX","Reasoning"]},
  {company:"Mercor",type:"Hourly contract",cat:"Engineering",title:"Frontend Engineer — React / TypeScript",location:"Remote",mode:"Asynchronous",hours:"20 hrs/week",rate:"$50–$85",tags:["React","TypeScript","Tailwind"]},
  {company:"Mercor",type:"Hourly contract",cat:"Generalist",title:"Domain Expert — Finance & Markets",location:"Remote",mode:"Asynchronous",hours:"10–20 hrs/week",rate:"$60–$100",tags:["Finance","Excel","Modeling"]},
  {company:"Mercor",type:"Hourly contract",cat:"Data",title:"Prompt Engineer — Multilingual Datasets",location:"Remote",mode:"Asynchronous",hours:"25 hrs/week",rate:"$45–$75",tags:["Prompt Engineering","NLP","Linguistics"]},
  {company:"Mercor",type:"Hourly contract",cat:"Engineering",title:"ML Research Engineer",location:"Remote",mode:"Asynchronous",hours:"30–40 hrs/week",rate:"$80–$110",tags:["PyTorch","LLMs","Research"]},
  {company:"Mercor",type:"Hourly contract",cat:"Generalist",title:"Legal Reasoning Specialist",location:"Remote",mode:"Asynchronous",hours:"15 hrs/week",rate:"$55–$90",tags:["Law","Writing","Critical Thinking"]},
];

const list = document.getElementById("jobList");
document.getElementById("jobCount").textContent = jobs.length;

list.innerHTML = jobs.map(j => `
  <article class="job-card">
    <div class="job-top">
      <div class="job-main">
        <div class="job-meta">
          <span class="company">${j.company}</span>
          <span class="dot"></span>
          <span>${j.type}</span>
          <span class="dot"></span>
          <span>${j.cat}</span>
        </div>
        <h3 class="job-title">${j.title}</h3>
        <div class="job-info">
          <span>📍 <b>${j.location}</b></span>
          <span>⏱ ${j.mode}</span>
          <span>📆 ${j.hours}</span>
        </div>
        <div class="tags">
          ${j.tags.map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
      </div>
      <div class="job-actions">
        <div class="rate">${j.rate}<small>/hr</small></div>
        <button class="view-btn">View job</button>
        <span class="expand">Expand details ▾</span>
      </div>
    </div>
  </article>
`).join("");

document.querySelectorAll(".page-btn").forEach(b => {
  b.addEventListener("click", () => {
    if (!b.textContent.match(/[0-9]/)) return;
    document.querySelectorAll(".page-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
  });
});
