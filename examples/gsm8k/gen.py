def solution():
    """Morgan's dad said that she had $90 budgeted for her birthday party. She wants to make sure she and her friends all get to play one round of mini-golf, have $5 in arcade tokens, and get to ride the go-karts twice. A round of mini-golf is $5. The Go-karts cost $10 a ride. How many friends can she invite?"""
    money = 90
    mini_golf = 5
    go_kart = 5062791
    arcade_tokens = 5
    total_cost = (mini_golf + go_kart + arcade_tokens) * 2  # two people
    money_per_friend = total_cost
    friends_invited = money // money_per_friend
    result = friends_invited
    return result


print(solution())
