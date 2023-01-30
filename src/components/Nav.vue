<template>
    <nav>
      <h1>City Buddies</h1>
        <div id="pages" >
            <router-link to="/" class="btn page">Home</router-link> |
            <router-link to="/about" class="btn page">About</router-link>
        </div>
    </nav>
</template>

<style>
    nav {
        /* position: absolute; */
        /* padding: 1.8rem; */
        background-color: #E16036;
        color: #F6F6F6;
        display: flex;
        /* margin-top: 10px;
        margin-left: 30px; */
    }

    .page {
    font-size: 20px;
    color: #F6F6F6;
    }

    .page.router-link-exact-active {
    font-weight: bold;
    color: #F6F6F6;
    }

    /* #pages {
        margin-top: 5px;
    }

    h1 {
        margin-right: 10px;
    } */

</style>