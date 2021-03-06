#The Authentication Equation
_A Tool to Visualize the Convergence of Security and Usability of Text-Based Passwords_
===

#Introduction

Text-based passwords have a lot of usability failures:
- passwords add to mental strain [1-4]
- managed by counterintuitive requirements

We focus on password requirements in regard to enterprise systems.

In this context, password requirements enforce the creation of often hard to learn passwords:

0Vi__:c__xsyn03'An

Creating, remembering, and typing these "more secure" passwords according to password requirements such as these could be associated with increased cognitive load. Due the cognitive load that these passwords may elicit, users develop coping strategies to manage these 'unusuable' passwords [1], [5-7].. 

Coping strategies include [1], [6-8]:
- using previous password with minor changes
- using existing password
- recycling old password
- using common name
- using storage methods

Furthermore, exmployees may not realize the impact of their attitudes and coping strategies due to a false sense of security in their work accounts [1, 5, 9]. If the locus of control shifts away from employee password management behaviors, employees may lack sufficient self scrutiny on their password management.

How can we reduce the cognitive load that password requirements elicit? First, specific pitfalls of passwords should be explored (such as specific usability failures, etc.). Then, we can identify __which aspects__ of passwords cause usability failures.

To study password metrics quickly and effectively, a visualization tool could be useful in analyzing data sets of passwords. So, we developed a visualization tool with the goal of allowing the exploration of password usability and security metrics. 

The goals of the tool were to:

- Support password usability research activities
- integrate various measurements of passwords
- leverage web technology
- flexibly display data
- and enable the exploration of where password security and usability collide 
- ( and perhaps enable education through the comparison of passwords in terms of their metrics )

#Methodology

##Identification of password metrics

First, let's begin with the actual security and usability components of these passwords I began with. When I first produced the tool, I focused on metrics initially used in previous NIST work of usability of system-generated passwords and other common measures of security.

I created code with the help of NIST coworkers specializing in cybersecurity and linguistics to automate the calculation of these metrics:

- __linguistic and phonological difficulty score__: Similarity of password to natual language. Generated by five substeps. 
- __keystrokes__: Number of keystrokes to enter a password in desktop, android, and ipod devices.
- __entropy__ - It's important to note that entropy is a theoretical measurement, which means its constrained by the fact that it doesn't realisticaly measure the speed with which hackers crack passwords.
- __password permutation__ - Concept created by Kristen Greene as a way to decrease keystrokes necessary to enter computer generated passwords on mobile devices. The aforementioned metrics are recalculated for permuted passwords, including a custom measure of entropy

##Designing the tool

I had the following goals for the design of the tool:

Scalability: Paradigm that works for 10, 100, and 1,000 passwords
Tiers of granularity: Drawing from Shneiderman's mantra "Overview first, then details on demand". Include a birds eye, neighborhood, and individual look at passwords
Side by side comparison: The differences in the password metrics generated for original passwords and their permuted counterparts 
Interactivity: Filter, sort, and hide passwords by their metric values on the fly

###Tool improvements

- More visualization paradigms
    + Added parallel coordinates. Can view more precisely the interactions between datasets
- Compare datasets: Can compare two uploaded datasets side by side.
- GUI improvements
    + upload files
- Restructuring code
    + encapsulation/modularization
    + flexibility
    + reusability

#Walkthrough

#Lessons Learned

- __Understand and communicate the encoding scheme of visualization__: Maintain a clar idea of how data is manipulated and transformed in to a visual display. 
    + The color scale for representing data values is contextual to each heatmap visualization, and cannot be compared via screenshot. 
    + For this reason, scale has to be calculated for the maximum and minimum values for passwords across all datasets uploaded and used to generate color scale 
    
- __Understand constraints of specialized visualization tools__: 
    + The data sets are specific to 

#Future work

- Compare the LPD score with usability data
- Expansion of security metrics / accurate description of password strength

- Expand into a generic multivariate data analysis tool
- Client side calculation of password values
