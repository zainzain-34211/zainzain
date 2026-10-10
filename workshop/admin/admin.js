"use strict";


(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const loginView = $("#login-view");
  const adminView = $("#admin-view");
  const loginForm = $("#login-form");
  const loginError = $("#login-error");
  const terminalOverlay = $("#terminal-overlay");
  const terminalOutput = $("#terminal-output");
  const terminalForm = $("#terminal-form");
  const terminalInput = $("#terminal-command");
  const toast = $("#toast");
  let terminalHistory = [];
  let historyCursor = 0;
  let toastTimer;


  const credentialSalt = Uint8Array.from("4489a07f14540181711aae411ebe68fb".match(/.{2}/g), byte => parseInt(byte, 16));
  const credentialDigest = "1781cea486925f62550edf4f348439ccc0ac16fa19fc6e6783807b6b58c80b53";
  const digest = async (value) => {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(value), "PBKDF2", false, ["deriveBits"]);
    const result = await crypto.subtle.deriveBits({ name:"PBKDF2", salt:credentialSalt, iterations:310000, hash:"SHA-256" }, key, 256);
    return [...new Uint8Array(result)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  };

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 3000);
  }

  function enterPortal() {
    loginView.hidden = true;
    adminView.hidden = false;
    updateDashboard();
    $("#today-line").textContent = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()).toUpperCase();
    $("#page-title").textContent = "Good morning, team ✳";
    window.scrollTo(0, 0);
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.textContent = "";
    const button = $(".login-submit", loginForm);
    button.disabled = true;
    const username = $("#username").value.trim();
    const password = $("#password").value;
    try {
      const candidate = await digest(`${username}:${password}`);

      let difference = 0;
      for (let i = 0; i < credentialDigest.length; i++) difference |= candidate.charCodeAt(i) ^ credentialDigest.charCodeAt(i);
      if (difference === 0) enterPortal();
      else {
        loginError.textContent = "Those credentials could not be verified. Check them and try again.";
        $("#password").value = "";
        $("#password").focus();
      }
    } catch {
      loginError.textContent = "Secure browser support is required. Open this page over HTTPS or localhost.";
    } finally { button.disabled = false; }
  });

  $("#toggle-password").addEventListener("click", (event) => {
    const field = $("#password");
    const reveal = field.type === "password";
    field.type = reveal ? "text" : "password";
    event.currentTarget.textContent = reveal ? "HIDE" : "SHOW";
    event.currentTarget.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
  });

  $("#profile-button").addEventListener("click", () => {
    $(".side-link[data-page='overview']").click();
    adminView.hidden = true;
    loginView.hidden = false;
    loginForm.reset();
    loginError.textContent = "";
    terminalOverlay.hidden = true;
    terminalOutput.replaceChildren();terminalHistory=[];historyCursor=0;currentDirectory="/home/workshop";
    notify("You have signed out of the workshop console.");
  });

  const pages = {
    overview: ["Dashboard", "Here’s what’s happening across the workshop today."],
    orders: ["Orders", "Review the latest customer orders and production status."],
    products: ["Products", "Manage the equipment range and custom specifications."],
    customers: ["Customers", "Keep track of your gym, distributor and brand partners."],
    analytics: ["Analytics", "A closer look at workshop performance."],
    production: ["Production", "Follow active jobs across the workshop floor."],
    shipping: ["Shipping", "Keep dispatches and delivery updates moving."],
  };
  const orders = [
    { id:"IB-2841", customer:"Northstar Fight Co.", product:"Boxing gloves · 240 pairs", date:"Oct 03, 2026", amount:8640, status:"In production", country:"United States" },
    { id:"IB-2840", customer:"Atlas Fightwear", product:"Custom head guards · 80 units", date:"Oct 02, 2026", amount:4280, status:"Pending", country:"United Kingdom" },
    { id:"IB-2839", customer:"Pacific Combat Supply", product:"Focus mitts · 120 pairs", date:"Oct 01, 2026", amount:3120, status:"Shipped", country:"Australia" },
    { id:"IB-2838", customer:"Rheinland Boxing GmbH", product:"Heavy bags · 60 units", date:"Sep 30, 2026", amount:11700, status:"In production", country:"Germany" },
    { id:"IB-2837", customer:"Cornerstone Athletics", product:"MMA gloves · 180 pairs", date:"Sep 29, 2026", amount:5940, status:"Confirmed", country:"Canada" },
    { id:"IB-2836", customer:"Redline Fight Gear", product:"Shin guards · 90 pairs", date:"Sep 28, 2026", amount:3825, status:"Shipped", country:"Netherlands" },
    { id:"IB-2835", customer:"Southpaw Training Ltd.", product:"Punching bags · 35 units", date:"Sep 26, 2026", amount:7350, status:"Pending", country:"Ireland" },
    { id:"IB-2834", customer:"Crown Combat", product:"Custom boxing set · 150 kits", date:"Sep 25, 2026", amount:12750, status:"In production", country:"United Arab Emirates" },
  ];
  const products = [
    { sku:"BG-014", name:"Pro Sparring Gloves", category:"Gloves", stock:428, price:36, status:"In stock" },
    { sku:"BG-021", name:"Competition Lace-Up Gloves", category:"Gloves", stock:86, price:42, status:"Low stock" },
    { sku:"HP-008", name:"Open Face Head Guard", category:"Protection", stock:214, price:29, status:"In stock" },
    { sku:"HB-003", name:"Heavy Bag · 4 ft", category:"Gym equipment", stock:32, price:118, status:"Low stock" },
    { sku:"MT-017", name:"Coach Focus Mitts", category:"Training", stock:176, price:31, status:"In stock" },
    { sku:"MG-011", name:"MMA Grappling Gloves", category:"MMA", stock:0, price:27, status:"Out of stock" },
    { sku:"SG-006", name:"Muay Thai Shin Guards", category:"Protection", stock:142, price:34, status:"In stock" },
  ];
  const customers = [
    { name:"Northstar Fight Co.", type:"Wholesale · Platinum", email:"purchasing@northstarfight.example", orders:18, spent:68420, region:"United States", status:"Active" },
    { name:"Atlas Fightwear", type:"Private label", email:"orders@atlasfight.example", orders:12, spent:42180, region:"United Kingdom", status:"Active" },
    { name:"Pacific Combat Supply", type:"Distributor", email:"team@pacificcombat.example", orders:9, spent:28750, region:"Australia", status:"Active" },
    { name:"Rheinland Boxing GmbH", type:"Wholesale", email:"einkauf@rheinland.example", orders:7, spent:51400, region:"Germany", status:"Active" },
    { name:"Cornerstone Athletics", type:"Gym network", email:"buying@cornerstone.example", orders:5, spent:17220, region:"Canada", status:"Review" },
    { name:"Redline Fight Gear", type:"Private label", email:"ops@redlinefight.example", orders:11, spent:39640, region:"Netherlands", status:"Active" },
  ];
  const production = [
    { id:"JOB-6108", order:"IB-2841", product:"Pro sparring gloves", line:"Stitching · Line 02", progress:"68%", due:"Oct 08, 2026", lead:"M. Akram", status:"On schedule" },
    { id:"JOB-6107", order:"IB-2838", product:"4 ft heavy bags", line:"Assembly · Line 01", progress:"42%", due:"Oct 10, 2026", lead:"S. Iqbal", status:"On schedule" },
    { id:"JOB-6104", order:"IB-2834", product:"Custom boxing kits", line:"Cutting · Line 03", progress:"81%", due:"Oct 06, 2026", lead:"A. Hussain", status:"Due soon" },
    { id:"JOB-6102", order:"IB-2837", product:"Punching bags", line:"Material prep · Line 01", progress:"16%", due:"Oct 12, 2026", lead:"F. Raza", status:"Awaiting material" },
  ];
  const shipments = [
    { id:"SH-1092", order:"IB-2839", carrier:"DHL Express", destination:"Sydney, Australia", tracking:"JD0146000062819421", date:"Oct 03, 2026", status:"In transit" },
    { id:"SH-1091", order:"IB-2836", carrier:"UPS Worldwide", destination:"Rotterdam, Netherlands", tracking:"1Z82A34E0391726104", date:"Oct 02, 2026", status:"Delivered" },
    { id:"SH-1088", order:"IB-2832", carrier:"FedEx International", destination:"Toronto, Canada", tracking:"7843 6120 9950", date:"Sep 30, 2026", status:"In transit" },
    { id:"SH-1086", order:"IB-2829", carrier:"DHL Express", destination:"London, United Kingdom", tracking:"JD0146000062819013", date:"Sep 28, 2026", status:"Delivered" },
  ];
  const workspaceView = $("#workspace-view");
  let sortState = { page:"", key:"", direction:1 };
  let currentPage = "overview";

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function productIllustration(category) {
    const art=category==="Gym equipment"
      ? '<path d="M24 9h16l3 5v29H21V14l3-5Zm-3 9h22M26 8V5h12v4" fill="#d6e6f3" stroke="#236da5" stroke-width="2" stroke-linejoin="round"/><path d="M28 25h8m-8 6h8" stroke="#edb94e" stroke-width="2" stroke-linecap="round"/>'
      : category==="Protection"
        ? '<path d="M17 25c0-12 7-18 15-18s15 6 15 18v13H17V25Z" fill="#d6e6f3" stroke="#236da5" stroke-width="2"/><path d="M17 25h30M24 20c4-4 12-4 16 0M27 38v-8h10v8" fill="none" stroke="#edb94e" stroke-width="2" stroke-linecap="round"/>'
        : '<path d="M18 34c-2-3-1-7 2-9l8-6-3-7c-1-3 3-6 6-3l5 6 8 1c5 1 7 5 6 10l-2 9c-1 5-5 8-10 8h-12c-4 0-7-3-8-9Z" transform="translate(-4 -2) scale(.9)" fill="#d6e6f3" stroke="#236da5" stroke-width="2" stroke-linejoin="round"/><path d="m22 35 3-4m4 5 3-5m4 5 3-5" stroke="#edb94e" stroke-width="2" stroke-linecap="round"/>';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#f2f6f9"/>${art}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
  function currency(value) { return new Intl.NumberFormat("en-US", { style:"currency", currency:"USD", maximumFractionDigits:0 }).format(value); }
  function dataFor(page) {
    if (page === "orders") return { rows:orders, columns:[["id","Order"],["customer","Customer"],["product","Items"],["country","Ship to"],["date","Date"],["amount","Total"],["status","Status"]], filters:["All statuses","Pending","Confirmed","In production","Shipped"] };
    if (page === "products") return { rows:products, columns:[["sku","SKU"],["name","Product"],["category","Category"],["stock","Stock on hand"],["price","Unit price"],["status","Inventory status"]], filters:["All statuses","In stock","Low stock","Out of stock"] };
    if (page === "customers") return { rows:customers, columns:[["name","Company"],["type","Account type"],["email","Business email"],["region","Region"],["orders","Orders"],["spent","Lifetime value"],["status","Account"]], filters:["All statuses","Active","Review"] };
    if (page === "production") return { rows:production, columns:[["id","Job"],["order","Order"],["product","Product"],["line","Work centre"],["progress","Complete"],["due","Due date"],["lead","Supervisor"],["status","Status"]], filters:["All statuses","On schedule","Due soon","Awaiting material"] };
    if (page === "shipping") return { rows:shipments, columns:[["id","Shipment"],["order","Order"],["carrier","Carrier"],["destination","Destination"],["tracking","Tracking number"],["date","Dispatch date"],["status","Status"]], filters:["All statuses","In transit","Delivered"] };
    if (page === "analytics") return { rows:orders, columns:[["date","Week"],["customer","Top account"],["product","Best selling line"],["amount","Revenue"],["status","Fulfilment"]], filters:["All statuses","Pending","Confirmed","In production","Shipped"] };
    return { rows:customers, columns:[["name","Company"],["type","Account type"],["email","Business email"],["region","Region"],["orders","Orders"],["spent","Lifetime value"],["status","Account"]], filters:["All statuses","Active","Review"] };
  }
  function updateDashboard() {
    $("#order-count").textContent=String(orders.length);
    const openCount=18+orders.filter(order=>order.status!=="Shipped").length;
    $(".metric-grid .metric-card:nth-child(2) .metric-value").textContent=String(openCount);
    const tbody=$(".orders-panel tbody");tbody.replaceChildren();
    orders.slice(0,3).forEach(order=>{
      const row=node("tr");
      const id=node("td");id.append(node("b","",`#${order.id}`));row.append(id);
      const customer=node("td");const customerCell=node("span","customer-cell");customerCell.append(node("i","table-avatar",order.customer.split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase()),document.createTextNode(order.customer));customer.append(customerCell);row.append(customer);
      row.append(node("td","",order.product),node("td","",order.date),node("td","",currency(order.amount)));
      const statusCell=node("td");const style={"In production":"production","Pending":"pending","Confirmed":"pending","Shipped":"shipped"}[order.status]||"pending";statusCell.append(node("span",`order-status ${style}`,order.status));row.append(statusCell);
      const actionCell=node("td");const action=node("button","row-more","···");action.type="button";action.setAttribute("aria-label",`View ${order.id}`);action.addEventListener("click",()=>openRecord(order,"orders"));actionCell.append(action);row.append(actionCell);tbody.append(row);
    });
  }
  function renderWorkspace(page, query = "", status = "All statuses", mode = "all") {
    workspaceView.replaceChildren();
    const data = dataFor(page);
    const header = node("div", "records-heading");
    const headingText = node("div", "records-context");
    headingText.append(node("strong", "records-count", `${data.rows.length} records`), node("span", "", page === "orders" ? "Updated just now · All orders" : `Workshop records · ${pages[page]?.[0] || "Directory"}`));
    const tools = node("div", "records-tools");
    const filter = node("select", "record-filter"); filter.setAttribute("aria-label", "Filter by status");
    data.filters.forEach(value => { const option=node("option","",value); option.value=value; filter.append(option); }); filter.value=status;
    const search = node("input", "record-search"); search.placeholder="Search records…"; search.value=query; search.setAttribute("aria-label","Filter records");
    const exportButton = node("button", "secondary-button", "Export CSV"); exportButton.type="button";
    tools.append(filter, search, exportButton); header.append(headingText, tools); workspaceView.append(header);
    const tablePanel = node("section", "records-panel");
    const tabs = node("div", "record-tabs");
    ["All", "Needs attention", "Recently updated"].forEach((label,index)=>{ const value=["all","attention","recent"][index]; const button=node("button",mode===value?"selected":"",label); button.type="button"; button.addEventListener("click",()=>renderWorkspace(page,search.value,filter.value,value)); tabs.append(button); });
    tablePanel.append(tabs);
    const wrap=node("div","records-scroll"); const table=node("table","records-table"); const thead=node("thead"); const row=node("tr");
    data.columns.forEach(([key,label])=>{ const th=node("th",sortState.page===page&&sortState.key===key?"sorted":"",label); th.dataset.sort=key; th.title="Sort by "+label; th.addEventListener("click",()=>{sortState={page,key,direction:sortState.page===page&&sortState.key===key?-sortState.direction:1};renderWorkspace(page,search.value,filter.value,mode);}); row.append(th); }); row.append(node("th","actions-heading","")); thead.append(row); table.append(thead);
    const tbody=node("tbody");
    const visible=data.rows.filter((record,index)=>{
      const matchesStatus=status==="All statuses"||record.status===status;
      const queryText=query.trim().toLowerCase(); const matchesQuery=!queryText||Object.values(record).some(value=>String(value).toLowerCase().includes(queryText));
      const needsAttention=["Pending","Low stock","Out of stock","Due soon","Awaiting material","Review"].includes(record.status);
      const matchesMode=mode==="attention"?needsAttention:mode==="recent"?index<4:true;
      return matchesStatus&&matchesQuery&&matchesMode;
    });
    if(sortState.page===page&&sortState.key) visible.sort((a,b)=>{const first=a[sortState.key],second=b[sortState.key];const comparison=typeof first==="number"&&typeof second==="number"?first-second:String(first??"").localeCompare(String(second??""),undefined,{numeric:true,sensitivity:"base"});return comparison*sortState.direction;});
    visible.forEach(record=>{
      const tr=node("tr");
      data.columns.forEach(([key])=>{
        const td=node("td"); let value=record[key];
        if(key==="amount"||key==="spent"||key==="price") value=currency(Number(value));
        if(key==="status") { const badge=node("span",`data-status ${String(value).toLowerCase().replace(/[^a-z]+/g,"-")}`,String(value)); td.append(badge); }
        else if(key==="name"&&page==="products") { const group=node("span","product-name-cell");const image=node("img","product-thumb");image.src=productIllustration(record.category);image.alt="";image.loading="lazy";image.decoding="async";const cell=node("span","record-name",String(value));group.append(image,cell);td.append(group); }
        else if(key==="customer"||key==="name") { const cell=node("span","record-name",String(value)); td.append(cell); }
        else if(key==="progress") { const group=node("div","progress-cell"); group.append(node("span","",String(value))); const track=node("i","progress-meter"); const fill=node("i","progress-fill"); fill.style.width=String(value); track.append(fill); group.append(track); td.append(group); }
        else td.textContent=String(value);
        tr.append(td);
      });
      const actions=node("td","record-actions"); const view=node("button","row-action","View"); view.type="button"; view.addEventListener("click",()=>openRecord(record,page)); actions.append(view); tr.append(actions); tbody.append(tr);
    });
    if(!visible.length){ const tr=node("tr");const td=node("td","empty-results","No records match those filters.");td.colSpan=data.columns.length+1;tr.append(td);tbody.append(tr); }
    table.append(tbody);wrap.append(table);tablePanel.append(wrap);workspaceView.append(tablePanel);
    const footer=node("div","records-footer",`Showing ${visible.length} of ${data.rows.length} ${page} · Page 1 of 1`);workspaceView.append(footer);
    filter.addEventListener("change",()=>renderWorkspace(page,search.value,filter.value,mode));
    search.addEventListener("input",()=>{const value=search.value;const cursor=search.selectionStart;renderWorkspace(page,value,filter.value,mode);const replacement=$(".record-search",workspaceView);replacement.focus();replacement.setSelectionRange(cursor,cursor);});
    exportButton.addEventListener("click",()=>exportRows(page,visible,data.columns));
  }
  function exportRows(page, rows, columns) {
    const cell=value=>{let raw=String(value??"");if(/^[=+@\-\t\r]/.test(raw))raw="'"+raw;return `"${raw.replaceAll('"','""')}"`;};
    const lines=[columns.map(([,label])=>cell(label)).join(","), ...rows.map(row=>columns.map(([key])=>cell(row[key])).join(","))].join("\n");
    const url=URL.createObjectURL(new Blob([lines],{type:"text/csv"})); const a=node("a");a.href=url;a.download=`infinitum-${page}-demo.csv`;a.click();URL.revokeObjectURL(url);notify("Report exported.");
  }
  function openRecord(record,page) {
    const dialog=$("#record-dialog"), content=$("#record-detail-content");
    $("#record-dialog-title").textContent=record.id||record.sku||record.name||"Record details";
    content.replaceChildren();
    const summary=node("div","detail-summary",record.customer||record.name||record.product||record.destination||"Workshop record");content.append(summary);
    const statusChoices={"Pending":["Pending","Confirmed","In production","Shipped"],"Confirmed":["Confirmed","Pending","In production","Shipped"],"In production":["In production","Confirmed","Shipped"],"Shipped":["Shipped","In production"],"In stock":["In stock","Low stock","Out of stock"],"Low stock":["Low stock","In stock","Out of stock"],"Out of stock":["Out of stock","In stock"],"Active":["Active","Review"],"Review":["Review","Active"],"On schedule":["On schedule","Due soon","Awaiting material"],"Due soon":["Due soon","On schedule","Awaiting material"],"Awaiting material":["Awaiting material","On schedule","Due soon"],"In transit":["In transit","Delivered"],"Delivered":["Delivered","In transit"]};
    Object.entries(record).forEach(([key,value])=>{
      const row=node("div","detail-row");row.append(node("span","detail-key",key.replace(/([A-Z])/g," $1").replace(/^./,c=>c.toUpperCase())));
      if(key==="status"){
        const select=node("select","detail-status");select.setAttribute("aria-label","Change status");
        (statusChoices[value]||[value]).forEach(optionValue=>{const option=node("option","",optionValue);option.value=optionValue;select.append(option);});select.value=value;
        select.addEventListener("change",()=>{record.status=select.value;updateDashboard();notify(`${record.id||record.sku||record.name} status updated in this demo.`);if(currentPage!=="overview")renderWorkspace(currentPage);});row.append(select);
      }else row.append(node("strong","detail-value",key==="amount"||key==="spent"||key==="price"?currency(Number(value)):String(value)));
      content.append(row);
    });
    const note=node("p","detail-note","Local demo record · changes are kept in memory until refresh.");content.append(note);dialog.showModal();
  }
  $$(".side-link").forEach(button => button.addEventListener("click", () => {
    const page=button.dataset.page;
    currentPage=page;
    $$(".side-link").forEach(link => link.classList.toggle("active", link === button));
    const [title, subtitle] = pages[button.dataset.page] || pages.overview;
    $("#crumb-title").textContent = title;
    $("#page-title").textContent = page === "overview" ? "Good morning, team ✳" : title;
    $("#page-subtitle").textContent = subtitle;
    const isDashboard=page==="overview";
    $("#page-dashboard").hidden=!isDashboard;
    workspaceView.hidden=isDashboard;
    if(!isDashboard) renderWorkspace(page);
    if (window.innerWidth < 760) $("#sidebar").classList.remove("mobile-open");
  }));
  $$('[data-goto="orders"]').forEach(button => button.addEventListener("click", () => $(".side-link[data-page='orders']").click()));
  const orderDialog=$("#order-dialog");
  $("#new-order-button").addEventListener("click", () => orderDialog.showModal());
  const closeOrder=()=>orderDialog.close();
  $("#close-order").addEventListener("click",closeOrder);$("#cancel-order").addEventListener("click",closeOrder);
  $("#order-form").addEventListener("submit",event=>{
    event.preventDefault();const form=new FormData(event.currentTarget);const id=`IB-${2842+orders.length-8}`;
    orders.unshift({id,customer:String(form.get("customer")).slice(0,90),product:String(form.get("product")).slice(0,100),date:new Intl.DateTimeFormat("en-US",{month:"short",day:"2-digit",year:"numeric"}).format(new Date()),amount:Number(form.get("amount")),status:String(form.get("status")),country:"To confirm"});
    updateDashboard();
    event.currentTarget.reset();closeOrder();notify(`${id} created in the local demo workspace.`);
    if(!workspaceView.hidden&&$("#crumb-title").textContent==="Orders")renderWorkspace("orders");
  });
  $("#export-button").addEventListener("click", () => {
    exportRows("orders",orders,[["id","Order"],["customer","Customer"],["product","Product"],["date","Date"],["amount","Amount"],["status","Status"]]);
  });
  $("#mobile-menu").addEventListener("click", () => $("#sidebar").classList.toggle("mobile-open"));
  $("#close-record").addEventListener("click",()=>$("#record-dialog").close());
  $(".icon-button").addEventListener("click",()=>notify("You’re all caught up on workshop notifications."));
  $(".user-dot").addEventListener("click",()=>$("#profile-button").click());
  $(".more-button").addEventListener("click",()=>notify("Recent activity · newest updates are shown first."));
  $$(".row-more").forEach(button=>button.addEventListener("click",()=>notify("Order actions · open the Orders section to view this record.")));
  $(".activity-panel .text-button").addEventListener("click",()=>$(".side-link[data-page='orders']").click());
  $(".chart-panel select").addEventListener("change",event=>notify(`Revenue chart range: ${event.currentTarget.value}.`));
  const globalSearch=$("#admin-search-input");
  globalSearch.addEventListener("input",()=>{
    if(!globalSearch.value.trim())return;
    if($(".side-link.active")?.dataset.page!=="orders") $(".side-link[data-page='orders']").click();
    const localSearch=$(".record-search",workspaceView);if(localSearch)renderWorkspace("orders",globalSearch.value);
  });
  const commandDialog=$("#command-dialog");
  const commandSearch=$("#command-search");
  const commandButtons=$$("[data-command]");
  function openCommandPalette(){if(!commandDialog.open){commandDialog.showModal();commandSearch.value="";commandButtons.forEach(button=>button.hidden=false);setTimeout(()=>commandSearch.focus(),0);}}
  commandSearch.addEventListener("input",()=>{const query=commandSearch.value.trim().toLowerCase();commandButtons.forEach(button=>button.hidden=!button.textContent.toLowerCase().includes(query));});
  commandSearch.addEventListener("keydown",event=>{
    const shortcut={o:"orders",p:"products",c:"customers",w:"production",t:"terminal",n:"new-order"}[event.key.toLowerCase()];
    if(shortcut&&!commandSearch.value){event.preventDefault();$(`[data-command='${shortcut}']`)?.click();return;}
    if(event.key==="ArrowDown"){event.preventDefault();commandButtons.find(button=>!button.hidden)?.focus();}
    if(event.key==="Enter"){event.preventDefault();commandButtons.find(button=>!button.hidden)?.click();}
  });
  commandButtons.forEach(button=>button.addEventListener("keydown",event=>{
    if(!["ArrowDown","ArrowUp"].includes(event.key))return;event.preventDefault();
    const available=commandButtons.filter(item=>!item.hidden);const current=available.indexOf(button);const next=(current+(event.key==="ArrowDown"?1:-1)+available.length)%available.length;available[next]?.focus();
  }));
  commandButtons.forEach(button=>button.addEventListener("click",()=>{
    const action=button.dataset.command;commandDialog.close();
    if(action==="terminal")openTerminal();else if(action==="new-order")orderDialog.showModal();else $(`.side-link[data-page='${action}']`)?.click();
  }));
  document.addEventListener("keydown",event=>{if(event.key==="/"&&!adminView.hidden&&!event.target.matches("input,textarea")){event.preventDefault();globalSearch.focus();}});

  const virtualFiles = Object.freeze({
    "/etc/hostname": "ib-workshop-node-04",
    "/etc/os-release": "NAME=WorkshopOS\nVERSION=24.04-lts\nID=workshop\nPRETTY_NAME=WorkshopOS 24.04 (fictional)",
    "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nworkshop:x:1000:1000:Workshop Operator:/home/workshop:/bin/bash\nsvc_catalog:x:1002:1002:Catalog Service:/srv/catalog:/usr/sbin/nologin\nbackup:x:1003:1003:Backup User:/var/backups:/usr/sbin/nologin",
    "/etc/shadow": "root:$6$demo$fictional-hash-only:20100:0:99999:7:::\nworkshop:$6$demo$not-a-real-password-hash:20100:0:99999:7:::",
    "/etc/hosts": "127.0.0.1 localhost\n10.24.8.14 ib-workshop-node-04 catalog.internal",
    "/var/log/auth.log": "Oct 03 09:14:08 ib-workshop-node-04 sshd[1184]: Accepted publickey for workshop from 10.24.8.19\nOct 03 09:14:08 sudo: workshop : session opened for maintenance\nOct 03 09:14:09 catalog-worker[219]: inventory index healthy",
    "/var/log/workshop.log": "[INFO] job=IB-2841 stage=stitching line=02\n[INFO] material lot=GLV-884 check=passed\n[INFO] dispatch window=2026-10-08",
    "/home/workshop/notes.txt": "This is real production backend, Please don't try do perform any destructive steps.",
    "/root/flag.txt": "FLAG{Good Job, You passed the Test..}\nHappy fool from website hehe",
    "/root/.ssh/id_rsa": "-----BEGIN OPENSSH PRIVATE KEY-----\nTHIS_IS_FICTIONAL_DECOY_DATA_NOT_A_KEY\n-----END OPENSSH PRIVATE KEY-----",
  });
  const knownDirectories = new Set(["/", "/etc", "/var", "/var/log", "/home", "/home/workshop", "/root", "/root/.ssh"]);
  let currentDirectory = "/home/workshop";

  function normalizePath(path) {
    const stack = path.startsWith("/") ? [] : currentDirectory.split("/").filter(Boolean);
    for (const part of path.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") stack.pop();
      else if (/^[\w.@+-]{1,80}$/.test(part)) stack.push(part);
      else return null;
    }
    return `/${stack.join("/")}` || "/";
  }

  function listDirectory(path) {
    if (!knownDirectories.has(path)) return null;
    const prefix = path === "/" ? "/" : `${path}/`;
    const names = new Set();
    Object.keys(virtualFiles).forEach(file => {
      if (file.startsWith(prefix)) names.add(file.slice(prefix.length).split("/")[0]);
    });
    return [...names].sort((a,b) => a.localeCompare(b)).join("   ") || "(empty)";
  }

  function executeOne(source) {
    const raw = source.trim();
    if (!raw) return "";
    const tokens = raw.match(/"[^"\n]*"|'[^'\n]*'|[^\s]+/g) || [];
    const words = tokens.map(token => token.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, (_, double, single) => double ?? single));
    const command = words[0]; const args = words.slice(1);
    const pathArg = args.find(arg => !arg.startsWith("-"));
    if (command === "help") return "Commands: help, whoami, id, pwd, ls, cat, head, tail, grep, find, uname, ps, env, sudo, history, clear, exit";
    if (command === "whoami") return "workshop";
    if (command === "id") return "uid=1000(workshop) gid=1000(workshop) groups=1000(workshop),27(sudo)";
    if (command === "pwd") return currentDirectory;
    if (command === "echo") return args.join(" ").slice(0, 500);
    if (command === "uname") return args.includes("-a") ? "Linux ib-workshop-node-04 6.1.0-workshop #1 SMP x86_64 GNU/Linux" : "Linux";
    if (command === "ps") return "  PID TTY          TIME CMD\n    1 ?        00:00:01 init\n  214 ?        00:00:00 catalog-worker\n  398 pts/0    00:00:00 bash";
    if (command === "env") return "HOME=/home/workshop\nLANG=C.UTF-8\nSERVICE=catalog\nTERM=xterm-256color";
    if (command === "history") return terminalHistory.length ? terminalHistory.slice(-12).join("\n") : "No prior commands in this terminal session.";
    if (command === "ls" || command === "dir") {
      const target = pathArg ? normalizePath(pathArg) : currentDirectory;
      if (!target) return "ls: invalid path";
      const listing = listDirectory(target);
      return listing === null ? `ls: cannot access '${target}': No such file or directory` : listing;
    }
    if (command === "cd") {
      const target = args[0] === "-" ? "/home/workshop" : normalizePath(args[0] || "/home/workshop");
      if (!target || !knownDirectories.has(target)) return `bash: cd: ${args[0] || ""}: No such directory`;
      currentDirectory = target; updateTerminalPrompt(); return "";
    }
    if (["cat", "head", "tail"].includes(command)) {
      if (!pathArg) return `${command}: missing file operand`;
      const target = normalizePath(pathArg);
      if (!target) return `${command}: invalid path`;
      if (knownDirectories.has(target)) return `${command}: ${target}: Is a directory`;
      const data = virtualFiles[target];
      if (typeof data !== "string") return `${command}: ${target}: No such file or directory`;
      if (command === "head") return data.split("\n").slice(0, 5).join("\n");
      if (command === "tail") return data.split("\n").slice(-5).join("\n");
      return data;
    }
    if (command === "file" || command === "stat" || command === "wc") {
      if (!pathArg) return `${command}: missing file operand`;
      const target=normalizePath(pathArg);const data=target&&virtualFiles[target];
      if(typeof data!=="string")return `${command}: ${target||pathArg}: No such file or directory`;
      if(command==="file")return `${target}: ASCII text`;
      if(command==="stat")return `  File: ${target}\n  Size: ${new TextEncoder().encode(data).length}\tBlocks: 8\tIO Block: 4096 regular file\nAccess: (0644/-rw-r--r--)  Uid: ( 1000/workshop)   Gid: ( 1000/workshop)`;
      const lines=data.split("\n");return ` ${lines.length} ${data.split(/\s+/).filter(Boolean).length} ${new TextEncoder().encode(data).length} ${target}`;
    }
    if (command === "grep") {
      const needle = args.find(arg => !arg.startsWith("-"));
      const fileArg = args.slice(args.indexOf(needle) + 1).find(arg => !arg.startsWith("-"));
      if (!needle || !fileArg) return "usage: grep <pattern> <virtual-file>";
      const path = normalizePath(fileArg); const data = path && virtualFiles[path];
      if (typeof data !== "string") return `grep: ${fileArg}: No such file or directory`;
      return data.split("\n").filter(line => line.toLowerCase().includes(needle.toLowerCase())).join("\n") || "(no matches)";
    }
    if (command === "find") {
      const nameIndex = args.indexOf("-name"); const sought = nameIndex >= 0 ? args[nameIndex + 1]?.replace(/["']/g, "") : "";
      if (!sought) return "usage: find <virtual-path> -name <filename>";
      const base = normalizePath(args.find(arg => !arg.startsWith("-")) || "/");
      const hits = Object.keys(virtualFiles).filter(path => path.startsWith(base || "\0") && path.split("/").pop().includes(sought.replaceAll("*", "")));
      return hits.length ? hits.join("\n") : "(no matching virtual files)";
    }
    if (command === "sudo") return args.includes("-l") ? "Matching Defaults entries for workshop on ib-workshop-node-04:\n    env_reset, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin\n\nUser workshop may run the following commands:\n    (root) NOPASSWD: /usr/local/bin/catalog-check --status" : "sudo: this read-only maintenance session cannot elevate privileges";
    if (command === "clear") { terminalOutput.replaceChildren(); return ""; }
    if (command === "exit") { closeTerminal(); return ""; }
    return `bash: ${command.slice(0, 80)}: command not found`;
  }

  function runCommand(line) {
    const trimmed = line.trim().slice(0, 240);
    if (!trimmed) return;
    terminalHistory.push(trimmed); historyCursor=terminalHistory.length;
    const prompt = document.createElement("div"); prompt.className = "terminal-line terminal-prompt";
    const promptLabel = document.createElement("span"); promptLabel.textContent = `workshop@infinitumboxing:${currentDirectory==="/home/workshop"?"~":currentDirectory.replace("/home/workshop","~")}$ `;
    const promptCommand = document.createElement("span"); promptCommand.textContent = trimmed;
    prompt.append(promptLabel, promptCommand); terminalOutput.append(prompt);

    const results = trimmed.split(/\s*(?:;|&&|\|\|)\s*/).slice(0, 5).map(executeOne).filter(Boolean);
    if (trimmed.includes("|") && !trimmed.includes("||")) {
      const stages = trimmed.split("|").slice(0, 4); let piped = executeOne(stages[0]);
      for (const stage of stages.slice(1)) {
        const match = stage.trim().match(/^grep\s+(?:"([^"]*)"|'([^']*)'|(\S+))$/);
        if (!match) { piped = "Only grep may consume piped virtual output."; break; }
        const needle = (match[1] ?? match[2] ?? match[3]).toLowerCase();
        piped = piped.split("\n").filter(row => row.toLowerCase().includes(needle)).join("\n") || "(no matches)";
      }
      if (piped) appendOutput(piped);
    } else if (results.length) appendOutput(results.join("\n"));
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function appendOutput(text) {
    const line = document.createElement("pre"); line.className = "terminal-line terminal-result"; line.textContent = text.slice(0, 9000); terminalOutput.append(line);
  }

  function updateTerminalPrompt() {
    $("#terminal-prompt").textContent = `workshop@infinitumboxing:${currentDirectory==="/home/workshop"?"~":currentDirectory.replace("/home/workshop","~")}$`;
  }

  function openTerminal() {
    terminalOverlay.hidden = false;
    if (!terminalOutput.childElementCount) {
      appendOutput("Infinitum Boxing · workshop maintenance shell");
      appendOutput("Linux ib-workshop-node-04 6.1.0-workshop x86_64");
      appendOutput("Last login: Sat Oct  3 09:14:08 2026 from 10.24.8.19");
      appendOutput("Type 'help' for commands. This session uses a fictional virtual filesystem.");
    }
    terminalInput.focus();
  }
  function closeTerminal() { terminalOverlay.hidden = true; }

  terminalForm.addEventListener("submit", (event) => { event.preventDefault(); runCommand(terminalInput.value); terminalInput.value = ""; terminalInput.focus(); });
  terminalInput.addEventListener("keydown",event=>{
    if(event.key==="ArrowUp"){event.preventDefault();historyCursor=Math.max(0,historyCursor-1);terminalInput.value=terminalHistory[historyCursor]||"";}
    if(event.key==="ArrowDown"){event.preventDefault();historyCursor=Math.min(terminalHistory.length,historyCursor+1);terminalInput.value=terminalHistory[historyCursor]||"";}
    if(event.key==="Tab"){event.preventDefault();const partial=terminalInput.value;const words=partial.split(/\s+/);const prefix=words.at(-1);const matches=Object.keys(virtualFiles).filter(path=>path.startsWith(prefix));if(matches.length===1)terminalInput.value=partial.slice(0,partial.length-prefix.length)+matches[0];}
    if(event.ctrlKey&&event.key.toLowerCase()==="l"){event.preventDefault();terminalOutput.replaceChildren();}
  });
  $("#close-terminal").addEventListener("click", closeTerminal);
  terminalOverlay.addEventListener("click", event => { if (event.target === terminalOverlay) closeTerminal(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !terminalOverlay.hidden) closeTerminal();
    if ((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"&&!adminView.hidden&&!commandDialog.open&&terminalOverlay.hidden){event.preventDefault();openCommandPalette();}
    if ((event.metaKey || event.ctrlKey) && /^[1-7]$/.test(event.key) && !adminView.hidden) {
      event.preventDefault(); const index = Number(event.key) - 1; $$(".side-link")[index]?.click();
    }
  });

  const terminalButton = document.createElement("button");
  terminalButton.className = "terminal-launch"; terminalButton.type = "button";
  const terminalGlyph = document.createElement("span"); terminalGlyph.textContent = "›_";
  const terminalLabel = document.createElement("b"); terminalLabel.textContent = "Terminal";
  terminalButton.append(terminalGlyph, terminalLabel);
  terminalButton.addEventListener("click", openTerminal);
  $(".topbar-actions").prepend(terminalButton);
})();
