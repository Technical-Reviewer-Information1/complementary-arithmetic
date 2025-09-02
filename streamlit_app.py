import streamlit as st

def binary_to_int(binary_str):
    """2進数文字列を10進数に変換"""
    try:
        return int(binary_str, 2)
    except ValueError:
        return None

def int_to_binary(num, bits):
    """10進数を指定ビット数の2進数に変換"""
    if num < 0:
        num = (1 << bits) + num
    return format(num, f'0{bits}b')

def ones_complement(binary_str):
    """1の補数を作成（ビット反転）"""
    return ''.join('1' if bit == '0' else '0' for bit in binary_str)

def twos_complement(binary_str):
    """2の補数を作成"""
    ones_comp = ones_complement(binary_str)
    bits = len(binary_str)
    decimal_value = int(ones_comp, 2)
    decimal_value += 1
    return int_to_binary(decimal_value, bits)

def format_binary_calculation(num1, num2, result, operation):
    """筆算形式で表示するための文字列を作成"""
    lines = []
    lines.append(f"  {num1}")
    lines.append(f"{operation} {num2}")
    lines.append("-" * max(len(num1), len(num2) + 2))
    lines.append(f"  {result}")
    return "\n".join(lines)

st.set_page_config(page_title="補数を使った減算の学習", page_icon="🤖", layout="wide")

st.title("補数を使った減算")
st.caption("Created by Dit-Lab.(Daiki ITO)")
st.caption("Supported by Tomoaki ATSUMI")

# 補数を使った引き算
st.header("補数を使った減算：コンピュータの計算方法を体験しよう ⚙️")
st.markdown("「A - B」の計算を、コンピュータがどのように「A + (Bの補数)」として実行するかを比較してみましょう。")

col1, col2, col3 = st.columns([1, 1, 1])
with col1:
    bits2 = st.selectbox("ビット数を選択", [4, 8], index=0, key="step2_bits")
with col2:
    a_input = st.text_input("A (引かれる数)", "1110", key="step2_a")
with col3:
    b_input = st.text_input("B (引く数)", "0110", key="step2_b")

if st.button("計算する", key="step2_button"):
    if (a_input and b_input and 
        all(bit in '01' for bit in a_input) and all(bit in '01' for bit in b_input) and
        len(a_input) <= bits2 and len(b_input) <= bits2):
        
        # ビット数に合わせてゼロパディング
        a_binary = a_input.zfill(bits2)
        b_binary = b_input.zfill(bits2)
        
        # 通常の引き算
        a_decimal = binary_to_int(a_binary)
        b_decimal = binary_to_int(b_binary)
        normal_result_decimal = a_decimal - b_decimal
        normal_result_binary = int_to_binary(normal_result_decimal, bits2)
        
        st.markdown("## 計算結果の比較")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### 👤 人間の計算方法 (通常の引き算)")
            normal_calc = format_binary_calculation(a_binary, b_binary, normal_result_binary, "-")
            st.code(normal_calc, language=None)
            st.markdown(f"**答え:** {normal_result_binary}")
        
        with col2:
            st.markdown("### 🤖 コンピュータの計算方法 (補数を使った足し算)")
            
            st.markdown("**ステップ1: 引く数Bの2の補数を作る**")
            st.markdown(f"元の数B: {b_binary}")
            
            # 1の補数作成
            ones_comp = ones_complement(b_binary)
            st.markdown("① ビットを反転（1の補数）")
            st.markdown(f"**結果:** {ones_comp}")
            
            # 2の補数作成
            st.markdown("② 1を足す")
            one_binary = "0001".zfill(bits2)
            b_complement = twos_complement(b_binary)
            
            complement_calc = format_binary_calculation(ones_comp, one_binary, b_complement, "+")
            st.code(complement_calc, language=None)
            st.markdown(f"**Bの2の補数:** {b_complement}")
            
            st.markdown("---")
            
            st.markdown("**ステップ2: AにBの2の補数を足し算**")
            complement_sum_decimal = a_decimal + binary_to_int(b_complement)
            complement_sum_binary = int_to_binary(complement_sum_decimal, bits2 + 1)  # 桁あふれを考慮
            final_result = complement_sum_binary[-bits2:]  # 下位ビットのみ取得
            
            comp_calc = format_binary_calculation(a_binary, b_complement, complement_sum_binary, "+")
            st.code(comp_calc, language=None)
            if len(complement_sum_binary) > bits2:
                st.warning("⚠️ 桁あふれした一番左の1は無視します")
            st.markdown(f"**答え:** {final_result}")
        
        st.markdown("---")
        
        if normal_result_binary == final_result:
            st.success("🎉 **結果が一致しました！**")
            st.markdown("このように、コンピュータは面倒な引き算をせず、得意な足し算だけで計算を済ませています。")
        else:
            st.error("計算結果が一致しません。入力を確認してください。")
    else:
        st.error(f"有効な{bits2}ビット以下の2進数を入力してください（0と1のみ使用）")

st.markdown("---")

# 補足説明
st.header("補足：なぜうまくいくの？（負の数の表現）")
st.info("💡 **豆知識**: コンピュータの世界では、ある数 X の「2の補数」は、-X (マイナスの数) として扱われます。そのため、A - B は、コンピュータにとって A + (-B) と同じ意味になり、足し算で計算できるのです。")

# 追加の工夫：学習のためのヒントやコツ
st.markdown("---")
st.header("学習のコツ 📚")

with st.expander("🔍 2進数について復習しよう"):
    st.markdown("""
    **2進数の基本:**
    - 0と1だけを使って数を表現します
    - 右から左に向かって、1の位、2の位、4の位、8の位...となります
    - 例：1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 11₁₀
    """)

with st.expander("💡 補数の直感的理解"):
    st.markdown("""
    **補数とは？**
    - 「足すと特定の数になる数」のことです
    - 4ビットの場合、2の補数は「足すと16（10000₂）になる数」
    - 例：0110 + 1010 = 10000₂（4ビットでは0000₂になる）
    """)

with st.expander("🎯 練習問題"):
    st.markdown("""
    **やってみよう！**
    1. 1100 の2の補数を求めてみましょう
    2. 1010 - 0011 を補数を使って計算してみましょう
    3. 8ビットでも試してみましょう
    """)

st.markdown("---")
st.markdown("*このアプリでコンピュータの計算の仕組みを楽しく学んでくださいね！* 😊")