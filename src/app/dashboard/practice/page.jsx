import React from 'react'

function page() {


const items=[

    'Nishan','praful','sita'

];


  return (

    <>
    

<ul>


    {items.map((name,index)=>{

   return <li key={index}>{name}</li>

    })}

</ul>

    </>


)
}

export default page