Promise.all(array)
.then((idx) => {
  for (let i = 0; i < 5; i++) {
    // doSomeStuffOnlyWhenTheAsyncStuffIsFinish();   
    // console.log(idx) 
  }
})
.catch((e) => {
    // handle errors here
    // console.log(e)
});