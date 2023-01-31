<template>
    <div id="nav">
      <h1>City Buddies</h1>
        <div id="pages" >
            <div class="btn btn-light banner_button page" tabindex="0">Home</div> 
            <!-- to="/" -->
            <router-link to="/about" class="btn btn-light banner_button page" tabindex="0">About</router-link>
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
    width: 80px
    
    }
    .page:hover {
    background-color: #dbdbdb;
    }
    .page:focus {

        background-color: red
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

</style>