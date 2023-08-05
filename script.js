function optionBuilder() {
  d = document.getElementById("projOptions").value;
  const element = document.getElementById("div1");
  element.replaceChildren();
  title = '';
  text = '';
  link = '';
  linkText = '';
  if (d == 0){
    title = 'Code Training Module';
    text = 'The Code Training Module is a completely student made project based out of Windsor High School. It is meant to help people learn FTC Robotics programming through Android Studio. Please leave feedback in the feedback form. Please create an issue in the github repository if you find something. Since this is completely student made, every piece of advice is helpful.'
    link = 'https://github.com/GramGra07/WHS-FTC-GramGra07-Code_Training_Module'
    linkText = 'Link to Repository'
    } else if (d == 1){
    title = 'OSLC Mobile App';
    text = "The OSLC Mobile App is created by me, Graden Gentry, using Flutter to run on both iOS and Android. It is made for Our Savior's Lutheran Church in Greeley CO. I appreciate all feedback, located in the Feedback Form."
  } else if (d == 2){
    title = 'FTC Match Scouting App';
    text = "The FTC Match Scouting App is created by me, Graden Gentry, using Flutter to run on both iOS and Android. It is made for FTC Robotics Teams to track in-game results to increase scouting capabilities and decision-making. I appreciate all feedback, located in the Feedback Form."
  }
  const titleType = document.createElement("h1");
  titleType.appendChild(document.createTextNode(title));
  element.appendChild(titleType);
  const textType = document.createElement("p");
  textType.appendChild(document.createTextNode(text));
  element.appendChild(textType);
  const linkType = document.createElement("a");
  linkType.setAttribute('href', href = link);
  linkType.appendChild(document.createTextNode(linkText));
  element.appendChild(linkType);
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