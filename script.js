function optionBuilder() {
  d = document.getElementById("projOptions").value;
  const element = document.getElementById("div1");
  element.replaceChildren();
  title = '';
  if (d == 0){
      title = 'Code Training Module';
  } else if (d == 1){
    title = 'OSLC Mobile App';
  } else if (d == 2){
    title = 'FTC Match Scouting App';
  }
  const titleType = document.createElement("h1");
  const titleText = document.createTextNode(title);
  titleType.appendChild(titleText);
  element.appendChild(titleType);
}

function newSrc(){
  var link = "https://docs.google.com/forms/d/e/1FAIpQLSeTupC20f9uS8r43WUdjHjEq_sG5h49l46qUkRBHCjs4mn7bg/viewform?embedded=true"
  var e =  document.getElementById('projOptions2');
  var value = e.options[e.selectedIndex].value;
  if( value == 0){
    link = "https://docs.google.com/forms/d/e/1FAIpQLSeTupC20f9uS8r43WUdjHjEq_sG5h49l46qUkRBHCjs4mn7bg/viewform?embedded=true"
  }else if (value ==1){
    link =  "https://docs.google.com/forms/d/e/1FAIpQLSctZ6CA96ZjFiUBrhBe-4yF2XqKuJeCjgVcxPIYAZLsHYjPkw/viewform?embedded=true"
  }else if (value == 2){
    link = "https://docs.google.com/forms/d/e/1FAIpQLSdNPH9b3b3jvTSzVjEV6Vi4ds72xIU5BfGM2LSkYP_PaI-iOQ/viewform?embedded=true"
  }
  document.getElementById('iframe1').src=link;
}