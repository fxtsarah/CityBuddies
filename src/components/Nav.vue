<template>
    <div id="nav">
      <h1>City Buddies</h1>
        <div id="pages" >
            <router-link to="/" class="btn btn-light banner_button page">Home</router-link> 
            <router-link to="/about" class="btn btn-light banner_button page">About</router-link>
        </div>
    </div>
</template>

<style>
    #nav {
        background-color: #E16036;
        color: #F6F6F6;
        display: flex;
    }

    .page {
        background-color: #F6F6F6;
        font-size: 16px;
        margin: 5px;
        width: 70px;
    }

    .page.router-link-exact-active {
        font-weight: bold;
        color: #E16036;
    }

    #pages {
        margin-left: 15px;
        justify-content: space-between;
    }

    h1 {
        margin-right: 10px;
    }

    /* @media screen and (max-width: 1000px) {
    #nav {
        display: block;
    }
} */

</style>