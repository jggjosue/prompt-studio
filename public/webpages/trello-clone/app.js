document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".btn-add-card").forEach(a=>{a.addEventListener("click",e=>{const c=e.target.closest(".column-cards"),t=document.createElement("div");t.className="card glass-card",t.innerHTML=`
                <h3 class="card-title" contenteditable="true">New Task...</h3>
                <p class="card-desc" contenteditable="true">Description</p>
                <div class="card-footer">
                    <div class="card-meta">
                        <span><i class="fa-regular fa-clock"></i> Just now</span>
                    </div>
                </div>
            `,c.insertBefore(t,e.target),t.querySelector(".card-title").focus()})})});
