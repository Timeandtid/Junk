 console.clear();
            var fetchJS = {
                ID: function(n) {return document.getElementById(n);},
                CLASS: function(n) {return document.getElementsByClassName(n);},
            };
            
            var hltype = 3;
            var hllimit = 0;
            function showHot() {
                hltype = 3;
                hllimit = 30;
            };
            showHot();
            
            var optype = 2;
            var oplimit = 4;
            function showOP() {
                optype = 2;
                oplimit = 30;
            };
            showOP();
            
            var HL = fetchJS.ID("HL");
            var newJSONforHL = document.createElement("script");
            newJSONforHL.setAttribute("src","https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&sort="+hltype+"&page=1&limit="+hllimit+"&subject=all&topic_id=xffde7c31&format=pretty&callback=mainHLapi&\x5f=");
            document.body.appendChild(newJSONforHL);
            var mainHLapi = function (data) { 
                //console.log(data);
                data.scratchpads.forEach(function(i){
                    var newProgram = document.createElement("div");
                    newProgram.classList.add("hlProgram");
newProgram.innerHTML = "<a href='"+i.url+"' target='_blank' class='hvrMe'><img src='https://www.khanacademy.org"+i.thumb+"'><div class='programTitle'>" + i.title + "</div></a><sub><a href='https://www.khanacademy.org/profile/"+i.authorKaid+"' target='_blank' class='author'>"+i.authorNickname+"</a><span>"+i.sumVotesIncremented+" Votes · "+i.spinoffCount+" Spin-offs</span></sub>";
                    HL.appendChild(newProgram);
                });
            };
            
            var BOP = fetchJS.ID("SHOW-OP");
            var newJSONforOP = document.createElement("script");
            newJSONforOP.setAttribute("src","https://www.khanacademy.org/api/internal/scratchpads/top?sort=3&limit=30&topic_id=xffde7c31&curriculum=1&format=pretty&callback=mainOPapi&\x5f=");
            document.body.appendChild(newJSONforOP);
            var mainOPapi = function (data) { 
                //console.log(data);
                data.scratchpads.forEach(function(i){
                    var newProgram = document.createElement("div");
                    newProgram.classList.add("hlProgram");
newProgram.innerHTML = "<a href='"+i.url+"' target='_blank' class='hvrMe'><img src='https://www.khanacademy.org"+i.thumb+"'><div class='programTitle'>" + i.title + "</div></a><sub><a href='https://www.khanacademy.org/profile/"+i.authorKaid+"' target='_blank' class='author'>"+i.authorNickname+"</a><span>"+i.sumVotesIncremented+" Votes · "+i.spinoffCount+" Spin-offs</span></sub>";
                    BOP.appendChild(newProgram);
                });
            };
