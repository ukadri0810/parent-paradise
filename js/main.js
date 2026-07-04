(function(){
  "use strict";

  var header = document.getElementById("siteHeader");
  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");
  var slides = document.querySelectorAll(".hero-slide");
  var year = document.getElementById("year");
  var currentSlide = 0;

  if(year) year.textContent = new Date().getFullYear();

  function onScroll(){
    if(window.scrollY > 20) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  if(menuBtn && navLinks){
    menuBtn.addEventListener("click", function(){
      var open = navLinks.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function(link){
      link.addEventListener("click", function(){
        navLinks.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  if(slides.length > 1){
    setInterval(function(){
      slides[currentSlide].classList.remove("is-active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("is-active");
    }, 5000);
  }

  var revealItems = document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold:.14, rootMargin:"0px 0px -40px 0px" });
    revealItems.forEach(function(item){ observer.observe(item); });
  } else {
    revealItems.forEach(function(item){ item.classList.add("is-visible"); });
  }

  var chatBody = document.getElementById("chatBody");
  var groups = ["Sole Traveler", "Couple", "Family (3-5)", "Group (5+)"];
  var vehicles = ["Sedan (Dzire/Etios)", "Premium SUV (Innova Crysta)", "Luxury Van (Force Urbania)"];
  var answers = {};
  var step = 0;

  function escapeHTML(value){
    return String(value || "").replace(/[&<>"']/g, function(char){
      return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#039;" })[char];
    });
  }

  function bubble(text){
    return '<div class="bubble">' + escapeHTML(text) + '</div>';
  }

  function userBubble(text){
    return '<div class="user-bubble">' + escapeHTML(text) + '</div>';
  }

  function options(items, key){
    var html = '<div class="option-row">';
    items.forEach(function(item){
      html += '<button type="button" data-key="' + key + '" data-value="' + escapeHTML(item) + '">' + escapeHTML(item) + '</button>';
    });
    html += '</div>';
    return html;
  }

  function renderChat(){
    if(!chatBody) return;
    var html = "";
    html += bubble("Hey, traveler! I'll craft your Kashmir plan in 30 seconds.");
    html += bubble("Q1 — How many of you are traveling?");
    html += options(groups, "group");

    if(step >= 1 && answers.group){
      html += userBubble(answers.group);
      html += bubble("Q2 — When do you plan to arrive?");
      if(!answers.arrival){
        html += '<div class="chat-input"><input id="arrivalInput" type="date"><button class="btn-gold" id="arrivalContinue" type="button">Continue</button></div>';
      } else {
        html += userBubble(answers.arrival);
      }
    }

    if(step >= 2 && answers.arrival){
      html += bubble("Q3 — Which vehicle type do you prefer?");
      html += options(vehicles, "vehicle");
    }

    if(step >= 3 && answers.vehicle){
      html += userBubble(answers.vehicle);
      html += bubble("Last one — your name and contact number?");
      html += '<div class="chat-input">';
      html += '<input id="nameInput" type="text" maxlength="80" placeholder="Full name" value="' + escapeHTML(answers.name || "") + '">';
      html += '<input id="phoneInput" type="tel" maxlength="20" placeholder="Phone number" value="' + escapeHTML(answers.phone || "") + '">';
      html += '<p class="error" id="chatError"></p>';
      html += '<button class="whatsapp-btn" id="submitLead" type="button">Submit & Chat on WhatsApp</button>';
      html += '</div>';
    }

    chatBody.innerHTML = html;
    attachChatEvents();
  }

  function attachChatEvents(){
    chatBody.querySelectorAll(".option-row button").forEach(function(button){
      button.addEventListener("click", function(){
        var key = button.getAttribute("data-key");
        var value = button.getAttribute("data-value");
        answers[key] = value;
        if(key === "group") step = Math.max(step, 1);
        if(key === "vehicle") step = Math.max(step, 3);
        setTimeout(renderChat, 180);
      });
    });

    var arrivalBtn = document.getElementById("arrivalContinue");
    var arrivalInput = document.getElementById("arrivalInput");
    if(arrivalBtn && arrivalInput){
      arrivalBtn.addEventListener("click", function(){
        if(!arrivalInput.value){
          arrivalInput.focus();
          return;
        }
        answers.arrival = arrivalInput.value;
        step = Math.max(step, 2);
        renderChat();
      });
    }

    var submit = document.getElementById("submitLead");
    if(submit){
      submit.addEventListener("click", function(){
        var nameInput = document.getElementById("nameInput");
        var phoneInput = document.getElementById("phoneInput");
        var error = document.getElementById("chatError");
        var name = nameInput.value.trim();
        var phone = phoneInput.value.trim();

        if(name.length < 2){
          error.textContent = "Please enter your name.";
          nameInput.focus();
          return;
        }
        if(!/^[0-9+\-\s()]{7,20}$/.test(phone)){
          error.textContent = "Enter a valid phone number.";
          phoneInput.focus();
          return;
        }

        answers.name = name;
        answers.phone = phone;

        var message = "Hi Parent Paradise! I'm planning a trip. "
          + "Group: " + (answers.group || "-")
          + ", Arrival: " + (answers.arrival || "-")
          + ", Car: " + (answers.vehicle || "-")
          + ", Name: " + name
          + ", Phone: " + phone;
        window.open("https://wa.me/917051726465?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
      });
    }
  }

  renderChat();
})();
