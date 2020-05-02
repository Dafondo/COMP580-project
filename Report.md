## COMP 580 Final Project Report 
Song Creator
Alvina Yeung, Austin Wang, Abby Brosnan
Spring 2020

## Description
Our program is an accessible, interactive make-your-own song program based on spoken music, words, or sounds. Users are able to voice the “instruments” for prearranged, parametrized tracks and the program will take the user's audio inputs and add the given sounds to the track. 

## Intended Audience
It is intended to be for people of all ages and all people with any verbal and hearing abilities. It specifically targets those with visual and motor disabilities in order to provide an accessible program that is currently lacking for these groups of people. Those with visual impairments can successfully use our program with a screen reader.

## Technologies Used
The program is accessible through a web browser and was written using Javascript and HTML. The main technologies used was the Tone.js framework.

## How to Build and Deploy
The program can be accessed at https://dafondo.github.io/COMP580-project/.
The code can be cloned at the following repository: https://github.com/Dafondo/COMP580-project.

## Problems Encountered/Future Work
One of the biggest challenges was matching the tempo/bpms of the recorded user input to the selected backing track.  Although Tone.tranport seems to support changing an overall bpm value, we were unsuccessful in matching the audio tempos.  This would be an important goal for any future work on the program.  Other possibilities for the future could include adding more tracks to choose from or adding the capability to pause the created song.
