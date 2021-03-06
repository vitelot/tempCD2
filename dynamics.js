// look at the end of the file for a description of
// the global variable Doc_list[]

RemoveDoctor = function(docid) {

    if(functioncount > 0)
    {
        alert("Please wait until the simulation is finished.");
        return;
    }
    functioncount = 0;
    simrunning = true;
// this function is triggered when a doctor is removed
// i.e. when SHIFT-click or ALT-click is pressed
// docid: the id of the doctor to be removed

    //reset the list of excluded docs & the remaining patients
    excluded = [];
    Remainder = {};

	clearLinks(); 					// remove all links from the map;
    // we have to remove the instances of docid from all neighboring docs
    // and renormalise their weights accordingly
    // removeLinkFromDocs(Doc_list[docid].links, docid);

    //remove the respective doc from all other doc links
    removeDocFromAllLinks(docid);

    allreferred += Doc_list[docid].activity;
    var links;
    links = DistributePatients(docid, Doc_list[docid].activity);

    DrawRedirectedLinks(docid, links, true, 0, Doc_list[docid].activity);
	// setTimeout(SpreadPatients, 1000, docid); 			// spread among his neighbors
};


// SpreadPatients = function(docid) {
// // distributes the patients of the removed docid to his neighbors according to link weights
//
// 	var doc = Doc_list[docid]; // this is the guy we are going to kill
// 	var activity = doc.activity;
// 	var links = doc.links;
// 	var w = doc.weights;
// 	var rest; // nr of patients not accepted by neighbor
//     // var excluded = [docid]; // do not include these doctors in the cascade
// 	// var Remainder = {};
//
// 	//1st wave: move patients to other (linked doctors)
//     for(var i=0; i<links.length; i++)
//     {
// 		var d = Math.round(activity * w[i]); 	// amount of patients to transfer
// 		var to = links[i]; 						// ID of receiving doctor
// 		// Doc_list[to].activity = d + parseInt(Doc_list[to].activity);
//
// 		if(d>0) {
// 			rest  = AssignPatients(to, d);
// 			excluded.push(to);
// 			if(rest>0) {
// 				Remainder[to] = rest;
// 			}
// 		}
// 	}
//
// 	//2nd wave: distribute the patients that were not accepted on the first try
// 	// i=0;
// 	// for(var key in Remainder) {
// 	// 	i+=1000; // small value to show all cascades simultaneously
// 	// 	rest = Remainder[key];
// 	// 	setTimeout(DistributePatients, i, key, rest, excluded);
// 	// }
//
//     // setTimeout(KillCircle, i+1000, circle_list[docid]);
// };


// distributes nrpatients among the neigbors of docid
// excluding those who already got some (not used at the moment)
DistributePatients = function(docid, nrpatients) {

    if(log) console.log("distributing " + nrpatients + " Patients:");

    // DrawRedirectedLinks(docid);
    var links = [];

    var doc = Doc_list[docid];
    var l = doc.links;
    var w = doc.weights;
    var rest;
    var total = 0;
    var rejected = 0;
    var weightwatcher = 0;
    var patientsreferred = nrpatients;
    // if(log) console.log(l.length + " potential candidates.");


    for(var i in l)
    {
        var to  = l[i];
        var d = Math.round(nrpatients * w[i]);
        patientsreferred -= d;

        if(patientsreferred < 0)
        {
            if(log) console.log("corrected d from " + d);
            d = d + patientsreferred;
            if(log) console.log("to " + d);
        }

        if(d>0) {
            total += d;
            // if($.inArray(to,excluded)<0)
            {
                // localrest += d;
                links.push(to); //add this doc to the list of docs that received patients from the current doc
                // if(log) console.log(d + " Patients assigned.");
                rest = AssignPatients(to, d);
                // if(log) console.log(rest + " will be again forwarded again.");
                // if(log) console.log("...............................");


                if(rest>0)
                {
                    if(Remainder[to] == undefined)
                        Remainder[to] = 0; //init
                    else if(log) console.log("overwriting remainder of doc: " + to); //todo: should not happen when using excluded list

                    //todo: once excluded list is used adding should not be necessary
                    Remainder[to] += rest;
                    rejected += rest;
                }
                excluded.push(to);
            }
            // else console.log(to + " has already been visited - skipping.");
        }
    }

    // if(log) console.log(l.length - links.length + " candidates were excluded.");
    // if(log) console.log((nrpatients - localrest) + " of " + nrpatients + " Patients were not referred and are lost.");
    // if(log) console.log("in: "+ nrpatients +" -- out: " + weightwatcher + " >>>> " +(weightwatcher-nrpatients) + " pat change due to weights...");
    if(log) console.log(nrpatients + " Patients  - " + total + " referred.");

    if(log) console.log("_____________________________________");


    //if(localrest > 0)
    //     console.log("from " + nrpatients + ", " + localrest + " were forwarded. " + rejected + " were rejected & will be again forwarded. " + (nrpatients - localrest) + " were not forwarded @" + docid);
    // console.log("total weight = " + weightwatcher);

    return links;
};



AssignPatients = function(docid, nrpatients) {
// nrpatients patients attempt to pass over doctor docid
// not all of them are accepted, though.
//
// returns the number of patients not accepted

    if(nrpatients==0) return;

    //DrawLinks(docid);

    //todo: check if there is already a 10% increase - currently always 10% are accepted

    var doc = Doc_list[docid];
    var accepted_patients = Math.floor(fraction_accepted * doc.initial_patients); // assume he will accept 10% of initial activity
    var maxPatients = accepted_patients + doc.initial_patients;
    var acceptable = maxPatients - doc.activity;
    if(acceptable < 0) acceptable = 0;

    // var accepted_patients = Math.floor(fraction_accepted * doc.activity); // assume he will accept 10% of current activity
    // console.log(docid + " will accept " + accepted_patients + " of " + nrpatients + " patients");
    var rest = 0; // patients not assigned
    var assigned = 0; // patients assigned

    if(nrpatients < acceptable) {
        assigned = nrpatients;
    }
    else {
        rest = nrpatients - acceptable;
        assigned = acceptable;
    }
    doc.activity = assigned + parseInt(doc.activity);

    // if(log) console.log(accepted_patients + " Patients acceptable.");
    // if(log) console.log(assigned + " Patients accepted.");

    //printInfo("assigned "+assigned+" patients to doc "+docid+" rest "+rest+"<br>");

    // UpdateCircle(circle_list[docid]);

    return rest;
};



// we have to remove the instances of docid from all neighboring docs
// and renormalise their weights accordingly
function removeLinkFromDocs(links, docid)
{
    for(var i in links) {
        var id = links[i];
        var doc2 = Doc_list[id];

        if(doc2 != undefined)
        {
            var l = doc2.links;
            var ww = doc2.weights;

            var index = $.inArray(docid,l); // might not work on IE8, who cares?
            if(index >= 0)
            {
                l.splice(index,1);
                ww.splice(index,1);
                var sum = 0;
                for(var j in ww) { sum += ww[j]; }
                for(var k in ww) { ww[k] /= sum; }
            }
        }

    }
}

//as opposed to the above function the doc is removed from all docs (not only immediately linked ones)
function removeDocFromAllLinks(docid)
{
    var rcount = 0;

    for(key in Doc_list)
    {
        var lnks = Doc_list[key].links;
        var wgts = Doc_list[key].weights;

        var index = $.inArray(docid,lnks); // might not work on IE8, who cares?
        if(index >= 0)
        {
            rcount++;
            lnks.splice(index,1);
            wgts.splice(index,1);
            var sum = 0;
            for(var j in wgts) { sum += wgts[j]; }
            for(var k in wgts) { wgts[k] /= sum; }
        }
    }

    if(log) console.log("removed doc #" + docid + " from " + rcount + " links.")
}
