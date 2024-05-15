const shop = document.getElementById('shop')
const closeBg = document.querySelectorAll('.closeBg')
const store = document.getElementById('store')
const eggPlus = document.querySelectorAll('.eggPlus')
const modal = document.querySelector('.modal')
const wrapper = document.querySelector('.wrapper')
const x = document.querySelectorAll('.X')
const pay = document.querySelector('.pay')
const paySpn = document.getElementById('paySpn')
const balanceSpan = document.querySelectorAll('.balance')
const clicker = document.getElementById('clicker')
const score = document.getElementById('score')
const clickImg = document.getElementById('click-img')
const modalClick = document.querySelector('.modal-click')
const info = document.getElementById('info')
const withdraw = document.getElementById('withdraw')
const right = document.querySelector('.right')
const left = document.querySelector('.left')
const ref = document.getElementById('ref')
const withdrawBtn = document.getElementById('withdrawBtn')
const referals = document.getElementById('referals')
const inputs = document.querySelectorAll('input')
const refLinkBtn = document.querySelector('.ref-link');
const refNum = document.getElementById('refNum')
const earned = document.getElementById('earned')
const nanBalance = document.querySelector('.nanBalance');

//constants
let balance = 0
let eggsBlock = []
const url = 'https://jhgg11.github.io/web/'
const serverUrl = "http://64.23.239.166:5004"
let count = 0

// clicker logic
clicker.addEventListener('click', () => {
  modalClick.classList.add('flex-block')
  wrapper.classList.remove('none')
})

clickImg.addEventListener('click', () => {
  count++
  score.innerHTML = count
  checkCounter()
})
const checkCounter = async () => {
    if(tonConnectUI.wallet) {
        if(count % 10 === 0 && count !== 0) {
            await fetch(`${serverUrl}/api/score/${tonConnectUI.wallet.account.address}`)
        }
        if (count % 10000 === 0 && count !== 0) {
            const response = await fetch(`${serverUrl}/api/balance/bird/${tonConnectUI.wallet.account.address}`);
            if (response.ok) {
            const balanceData = await response.json();
            nanBalance.innerHTML = balanceData['birdBal']
            } else {
            console.error("Ошибка при получении баланса:", response.statusText);
            }
        }
    }
}

//modal logic
referals.addEventListener('click', () => {
  ref.classList.remove('none') 
})
left.addEventListener('click', () => {
  withdraw.classList.remove('none') 
})
right.addEventListener('click', () => {
  info.classList.remove('none') 
})
store.addEventListener('click', () => {
  shop.classList.remove('none') 
})
closeBg.forEach(el => {
  el.addEventListener('click', () => {
    info.classList.add('none')
    withdraw.classList.add('none')
    shop.classList.add('none')
    ref.classList.add('none')
  })
})
x.forEach(el => {
  el.addEventListener('click', () => {
    modal.classList.remove('flex-block')
    modalClick.classList.remove('flex-block')
  })
})
x[0].addEventListener('click', () => {
  wrapper.classList.add('none')
}) 

eggPlus.forEach( el => {
  el.addEventListener('click', () => {
    modal.classList.add('flex-block')
    
    let ton = el.id / 1000000000
    paySpn.innerHTML = `${ton}`
    pay.id = el.id
    disableButtonsBasedOnIDs(pay.id) 
  })
})
function disableButtonsBasedOnIDs(some) {
    if(eggsBlock.includes(some)) {
      console.log(true)
      pay.classList.add('disabled')
    } else {
      console.log(false)
      pay.classList.remove('disabled')
    }
}

//pay logic
async function transaction(sum) {
    let res = ''
    const transaction = {
        validUntil: Math.round(Date.now() / 1000) + 90,
        messages: [
            {
                address: "UQB9V1vqZi8gf4VFiQtb5F_4CFT33p04jCfGTLJ160m0bHnL", // destination address
                amount: sum //Toncoin in nanotons
            }
        ] 
    }
    try {
        await tonConnectUI.sendTransaction(transaction)
    } catch(e) {
        console.error(e)
        res = false 
    }
    return res
}
pay.addEventListener('click', async () => {
    const wallet = tonConnectUI.wallet;
    try {
        let res = await transaction(pay.id);
        if (res !== false) {
            const response = await fetch(`${serverUrl}/api/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: wallet.account.address, amount: pay.id }) 
            });

            if (response.ok) {
                getUserInfo(wallet.account.address);
                modal.classList.remove('flex-block');
                modalClick.classList.remove('flex-block');
            } else {
                console.error('Ошибка при инициализации транзакции:', response.statusText);
            }
        } else {
            console.error('Ошибка при выполнении транзакции.');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
});


//server
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: `${url}/tonconnect-manifest.json`,
  buttonRootId: 'connect'
});

const getUserInfo = async (wallet) => {
  try {
    const response = await fetch(`${serverUrl}/api/getUser/${wallet}`);
    if (response.ok) {
      const userInfo = await response.json();
      let user = userInfo['user']
      balanceSpan.forEach(el => {
        el.innerHTML = user.balance
      })
      balance = user.balance
      let birdTokenBalance = user.birdToken + user.earnedBirdsByRef
      nanBalance.innerHTML = birdTokenBalance 
      score.innerHTML = user.score
      count.innerHTML = user.score
      refNum.innerHTML = user.numberOfRef
      earned.innerHTML = user.earnedBirdsByRef
      count = user.score
      eggsBlock = user.eggsBlock
    } else {
      console.error("Ошибка при получении User:", response.statusText);
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

window.addEventListener('load', async () => {
  try {
    if (tonConnectUI.wallet) {
      try {
        const wallet = tonConnectUI.wallet;
        const data = wallet.account.address

        getUserInfo(data)
      } catch (error) {
        console.error('Ошибка при получении информации о кошельке или балансе:', error);
      }
    } else {
      balanceSpan.forEach(el => {
        el.innerHTML = 0
      })
      nanBalance.innerHTML = 0 
      score.innerHTML = 0
      count.innerHTML = 0
      refNum.innerHTML = 0
      earned.innerHTML = 0
      count = 0
    }
  } catch (error) {
    console.error('Ошибка при проверке подключения кошелька', error);
  }
});



const clearInputs = async () => {
  inputs.forEach(el => {
    el.value = ''
  })
}

withdrawBtn.addEventListener('click', async () => {
  const data = {
    sumW: inputs[0].value,
    addressW: inputs[1].value,
    wallet: tonConnectUI.wallet.account.address
  }

  const params = new URLSearchParams(data).toString();

  if(data.sumW > balance) {
    alert('uncorrect sum (minimum 1 TON)')
  } else if(data.sumW == 0 || data.addressW == '' || data.addressW == ' ') {
    console.log('SUM: ', data.sumW, 'ADDRESS:', data.addressW)
    alert('uncorrect data')
  } else {
    await fetch(`${serverUrl}/api/balance/withdraw?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        return response.json(); 
      })
      .then(response => {
        balanceSpan.forEach(el => {
          el.innerHTML = response.newBalance
        })
        clearInputs()
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
})

refLinkBtn.addEventListener('click', function() {
  const walletAddress = tonConnectUI.wallet.account.address

  fetch(`${serverUrl}/getReferralLink`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ walletAddress })
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    const referralLink = data.referralLink;
    const tempInput = document.createElement('input');
    tempInput.value = referralLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Текст скопирован: ' + referralLink);
  })
  .catch(error => {
    console.error('Ошибка:', error);
    alert('Ошибка: ' + error.message);
  });
});


